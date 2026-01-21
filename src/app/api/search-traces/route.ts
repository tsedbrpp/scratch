import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage-service';
import { checkRateLimit } from '@/lib/ratelimit';
import { auth } from '@clerk/nextjs/server';
import { isReadOnlyAccess } from '@/lib/auth-helper';
import { executeGoogleSearch, curateResultsWithOpenAI, SearchResult, getMockResults } from '@/lib/search-service';
import { createRateLimitResponse, createUnauthorizedResponse, createErrorResponse } from '@/lib/api-helpers';

// Removed KEY_TERM_EXTRACTION_PROMPT - moved to registry

interface Trace {
    title: string;
    description: string;
    content: string;
    sourceUrl: string;
    platform: string;
    query: string;
    strategy?: string;
    explanation?: string;
}

export async function POST(request: NextRequest) {
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Demo Search is Disabled. Read-Only Mode." }, { status: 403 });
    }
    let { userId } = await auth();
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return createUnauthorizedResponse();
    }
    // if (!userId) userId = "debug_user";

    // Rate Limiting
    const rateLimit = await checkRateLimit(userId); // Uses default 25 requests per minute
    if (!rateLimit.success) {
        return createRateLimitResponse(rateLimit);
    }


    try {
        const body = await request.json();
        const { policyText, policyTitle, customQuery, platforms } = body;
        console.log("DEBUG: Search Request Received:", {
            policyTitle,
            customQuery,
            platforms,
            policyTextLength: policyText?.length
        });

        // Generate cache key
        const cacheKey = `user:${userId}:search-traces-v27-classified:${Buffer.from(JSON.stringify({ policyText: policyText?.slice(0, 100), customQuery, platforms })).toString('base64')}`;

        // Check cache
        try {
            const cachedData = await StorageService.getCache(userId, cacheKey);
            // Define expected structure
            interface CachedSearchResult {
                traces: Trace[];
                queriesUsed: string[];
                success: boolean;
            }

            if (cachedData) {
                const typedCache = cachedData as unknown as CachedSearchResult;
                if (typedCache.traces && typedCache.traces.length > 0) {
                    console.log('Returning cached search traces');
                    return NextResponse.json(typedCache);
                }
            }
        } catch (error) {
            console.error('Redis cache check failed:', error);
        }

        // Check for required API keys
        const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
        const searchEngineId = process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_SEARCH_ENGINE_ID;


        if (!googleApiKey || !searchEngineId) {
            return createErrorResponse(new Error("Google Search API not configured"), "Server Configuration Error");
        }



        // Define Semantic Resistance Strategies
        const RESISTANCE_STRATEGIES = {
            gambiarra: '("workaround" OR "hack" OR "bypass" OR "trick" OR "loophole" OR "shadow IT" OR "creative solution")',
            obfuscation: '("data poisoning" OR "adversarial noise" OR "cloak" OR "hide" OR "camouflage" OR "algo-speak" OR "digital mask")',
            solidarity: '("union" OR "strike" OR "collective action" OR "organizing" OR "forum guide" OR "shared tactics" OR "worker group")',
            refusal: '("opt-out" OR "non-compliance" OR "refuse" OR "uninstall" OR "block" OR "boycott" OR "working to rule")'
        };

        let searchQueries: string[] = [];
        let policyContext = "";

        // 1. Determine Context (The "Subject" of the search)
        if (policyTitle && policyTitle.trim()) {
            policyContext = policyTitle.trim();
        } else if (policyText) {
            // Fallback: heuristic extraction
            policyContext = policyText.split('\n')[0].substring(0, 100).replace(/["']/g, "");
            if (policyContext.length < 5) policyContext = "AI Governance Algorithm";
        }

        if (!policyContext && !customQuery) {
            return NextResponse.json(
                { error: 'Either policy document (Title/Text) or customQuery must be provided' },
                { status: 400 }
            );
        }

        // 2. Build Queries
        const contextPrefix = policyContext ? `"${policyContext}"` : "";
        const combinedContext = `${contextPrefix} ${customQuery || ""}`.trim();

        // Check if the query is "Strategic" (contains resistance keywords)
        const isStrategicQuery = (q: string) => {
            const keywords = ["hack", "workaround", "bypass", "protest", "strike", "union", "refus", "opt-out", "block", "hidden", "private", "noise"];
            return keywords.some(k => q.toLowerCase().includes(k));
        };

        if (customQuery && isStrategicQuery(customQuery)) {
            // User knows what they are doing (e.g. "drivers strike")
            searchQueries = [combinedContext];
            console.log(`Using explicit custom strategy: ${searchQueries[0]}`);
        } else {
            // User provided a subject (e.g. "India AI") or just relying on policy title
            // Generate 4 strategic variants using the Combined Context as the subject
            const baseSubject = combinedContext || "AI Governance Algorithm";

            searchQueries.push(`${baseSubject} ${RESISTANCE_STRATEGIES.gambiarra}`.trim());
            searchQueries.push(`${baseSubject} ${RESISTANCE_STRATEGIES.obfuscation}`.trim());
            searchQueries.push(`${baseSubject} ${RESISTANCE_STRATEGIES.solidarity}`.trim());
            searchQueries.push(`${baseSubject} ${RESISTANCE_STRATEGIES.refusal}`.trim());

            console.log(`Auto-expanded generic query into strategies for: ${baseSubject}`);
        }

        // Just log, don't re-push generic terms
        console.log("Strategic Queries:", searchQueries);
        console.log("Platforms:", platforms);

        // Construct platform-specific queries
        const platformFilters = platforms || ['reddit', 'hackernews', 'forums'];
        const allTraces: Trace[] = [];

        for (const query of searchQueries.slice(0, 4)) { // Limit to 4 queries (one per strategy)
            // Split platforms into two groups to prevent Reddit from drowning out others
            const dominantPlatforms = platformFilters.filter((p: string) => ['reddit', 'hackernews', 'forums'].includes(p));
            const diversePlatforms = platformFilters.filter((p: string) => !['reddit', 'hackernews', 'forums'].includes(p));

            const searchPromises: Promise<{ type: string, items: SearchResult[] }>[] = [];

            // Group A: Dominant
            if (dominantPlatforms.length > 0) {
                const platformQueries: string[] = [];
                if (dominantPlatforms.includes('reddit')) platformQueries.push('site:reddit.com');
                if (dominantPlatforms.includes('hackernews')) platformQueries.push('site:news.ycombinator.com');
                if (dominantPlatforms.includes('forums')) platformQueries.push('(forum OR discussion)');

                const siteQuery = `${query} (${platformQueries.join(' OR ')})`;
                searchPromises.push(
                    executeGoogleSearch(siteQuery, googleApiKey, searchEngineId)
                        .then(items => ({ type: 'dominant', items }))
                );
            }

            // Group B: Diverse
            if (diversePlatforms.length > 0) {
                const platformQueries: string[] = [];
                if (diversePlatforms.includes('twitter')) platformQueries.push('(site:twitter.com OR site:x.com)');
                if (diversePlatforms.includes('technews')) platformQueries.push('(site:wired.com OR site:theverge.com OR site:techcrunch.com OR site:arstechnica.com OR site:theregister.com)');
                if (diversePlatforms.includes('mastodon')) platformQueries.push('(site:mastodon.social OR site:mstdn.social OR site:fosstodon.org)');

                const siteQuery = `${query} (${platformQueries.join(' OR ')})`;
                searchPromises.push(
                    executeGoogleSearch(siteQuery, googleApiKey, searchEngineId)
                        .then(items => ({ type: 'diverse', items }))
                );
            }

            // Execute parallel searches
            const results = await Promise.all(searchPromises);

            // Interleave Strategy
            const dominantResults = results.find(r => r.type === 'dominant')?.items || [];
            const diverseResults = results.find(r => r.type === 'diverse')?.items || [];
            const maxLength = Math.max(dominantResults.length, diverseResults.length);

            // DIAGNOSTIC: Check for missing diverse results
            if (diversePlatforms.length > 0 && diverseResults.length === 0 && dominantResults.length > 0) {
                allTraces.push({
                    title: "⚠️ Configuration Check Required",
                    description: "No results found from Twitter/TechNews/Mastodon.",
                    content: "If you enabled 'Search the entire web' recently, it may take a few hours to propagate. Or, your search engine might still be restricted to Reddit/HN only. Please check https://programmablesearchengine.google.com/",
                    sourceUrl: "https://programmablesearchengine.google.com/",
                    platform: "web",
                    query: "System Message",
                    strategy: undefined,
                    explanation: undefined
                });
            }

            for (let i = 0; i < maxLength; i++) {
                if (i < diverseResults.length) processItem(diverseResults[i], query);
                if (i < dominantResults.length) processItem(dominantResults[i], query);
            }
        }

        // ==========================================
        // FALLBACK: BROAD SEARCH (If Strict Failed)
        // ==========================================
        if (allTraces.length === 0) {
            console.log("Strict search yielded 0 results. Attempting Broad Search...");

            // Remove quotes and strict strategy groups, just look for the subject + broad resistance terms
            const cleanSubject = policyContext.replace(/["']/g, "");
            const broadQuery = `${cleanSubject} (controversy OR criticism OR problem OR resistance)`;

            console.log(`Fallback Broad Query: ${broadQuery}`);

            // Run a simple, single search
            const broadResults = await executeGoogleSearch(broadQuery, googleApiKey, searchEngineId);

            broadResults.forEach(item => {
                processItem(item, broadQuery);
            });
        }

        function processItem(item: SearchResult, query: string) {
            let detectedPlatform = 'web';
            const link = item.link.toLowerCase();
            if (link.includes('reddit.com')) detectedPlatform = 'reddit';
            else if (link.includes('ycombinator.com')) detectedPlatform = 'hackernews';
            else if (link.includes('twitter.com') || link.includes('x.com')) detectedPlatform = 'twitter';
            else if (link.includes('mastodon') || link.includes('mstdn') || link.includes('fosstodon')) detectedPlatform = 'mastodon';
            else if (link.includes('wired') || link.includes('theverge') || link.includes('techcrunch') || link.includes('arstechnica')) detectedPlatform = 'technews';
            else detectedPlatform = 'forums';

            allTraces.push({
                title: item.title,
                description: `From ${new URL(item.link).hostname}`,
                content: item.snippet,
                sourceUrl: item.link,
                platform: detectedPlatform,
                query: query
            });
        }

        // ==========================================
        // AI CURATION & CLASSIFICATION STEP (SERVICE)
        // ==========================================
        let finalTraces = allTraces;
        console.log(`DEBUG: Traces found before AI: ${allTraces.length}`);

        if (allTraces.length > 0) {
            let curatedFinal: SearchResult[] = [];
            let curationSource = "None";

            const openaiKey = process.env.OPENAI_API_KEY;

            // [Refactor] Centralized Policy Subject Logic
            let policySubject = "AI Resistance";
            if (policyText) policySubject = policyText.substring(0, 100).split('\n')[0];
            else if (customQuery) policySubject = customQuery;

            const searchResults: SearchResult[] = allTraces.map(t => ({
                title: t.title,
                link: t.sourceUrl,
                snippet: t.content
            }));



            // 2. OpenAI Curation (Primary)
            if (openaiKey) {
                console.log("Starting AI Curation Service (OpenAI Primary)...");
                try {
                    curatedFinal = await curateResultsWithOpenAI(searchResults, policySubject, openaiKey, process.env.OPENAI_MODEL || 'gpt-4o', userId);
                    curationSource = "OpenAI";
                } catch (e) {
                    console.error("OpenAI Curation Failed:", e);
                }
            }

            // [Enhanced Fallback] If we have extremely low yield (< 3) but many raw results, 
            // fill the gap with raw results labeled as "Potential Resistance".
            if (curatedFinal.length < 3 && allTraces.length >= 3) {
                console.log(`Low yield (${curatedFinal.length}) detected. Backfilling with raw traces.`);

                // Find indices already curated
                const curatedLinks = new Set(curatedFinal.map(c => c.link));

                // Filter un-curated
                const remaining = allTraces.filter(t => !curatedLinks.has(t.sourceUrl));

                // Add up to 5 more
                remaining.slice(0, 5).forEach(t => {
                    curatedFinal.push({
                        title: t.title,
                        link: t.sourceUrl,
                        snippet: t.content,
                        strategy: "Potential Resistance",
                        explanation: "Identified by keyword matching (AI classification skipped or low confidence)."
                    });
                });
            }

            if (curatedFinal.length === 0) {
                // If everything failed, use original
                curatedFinal = allTraces.map(t => ({
                    title: t.title,
                    link: t.sourceUrl,
                    snippet: t.content,
                    strategy: "Unclassified",
                    explanation: "Automated keyword match."
                }));
            }

            // Merge back
            finalTraces = curatedFinal.map(curated => {
                const original = allTraces.find(t => t.sourceUrl === curated.link);
                return {
                    title: curated.title,
                    description: original?.description || `From ${new URL(curated.link).hostname}`,
                    content: curated.snippet,
                    sourceUrl: curated.link,
                    platform: original?.platform || 'web',
                    query: original?.query || customQuery || '',
                    strategy: curated.strategy,
                    explanation: curated.explanation
                };
            });
            console.log("Curation Source:", curationSource);
        }

        if (finalTraces.length === 0) {
            console.log("Zero results found from Live Search API.");
        }

        const result = {
            success: true,
            traces: finalTraces,
            queriesUsed: searchQueries.slice(0, 2)
        };

        if (finalTraces.length > 0) {
            console.log("DEBUG: Final outgoing traces count:", finalTraces.length);
            console.log("DEBUG: First trace explanation:", finalTraces[0].explanation);
        }

        // Cache result (expire in 24 hours)
        try {
            await StorageService.setCache(userId, cacheKey, result, 60 * 60 * 24);
        } catch (error) {
            console.error('Failed to cache search traces:', error);
        }

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });

    } catch (error: unknown) {
        return createErrorResponse(error, 'Search failed');
    }
}

export async function DELETE(request: NextRequest) {
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Demo Mode is Read-Only." }, { status: 403 });
    }

    let { userId } = await auth();
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return createUnauthorizedResponse();
    }

    try {
        const body = await request.json();
        const { policyText, customQuery, platforms } = body;

        // Generate cache key (Must match POST logic exactly)
        const cacheKey = `user:${userId}:search-traces-v27-classified:${Buffer.from(JSON.stringify({ policyText: policyText?.slice(0, 100), customQuery, platforms })).toString('base64')}`;

        await StorageService.deleteCache(userId, cacheKey);
        console.log(`Cache cleared for key: ${cacheKey}`);

        return NextResponse.json({ success: true, message: "Cache cleared" });
    } catch (error) {
        return createErrorResponse(error, "Failed to clear cache");
    }
}
