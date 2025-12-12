import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import { checkRateLimit } from '@/lib/ratelimit';
import { auth } from '@clerk/nextjs/server';
import { executeGoogleSearch, curateResultsWithAI, SearchResult } from '@/lib/search-service';

const KEY_TERM_EXTRACTION_PROMPT = `You are an expert researcher analyzing policy documents to identify key terms for web searches.

Your task is to extract 3-5 specific, searchable terms or phrases from the policy text that would help find real-world discussions about resistance, criticism, or adaptation to this policy.

Focus on:
- Specific mechanisms or requirements (e.g., "facial recognition ban", "high-risk AI systems")
- Controversial or burdensome aspects
- Terms that affected communities would use (e.g., "gig worker surveillance", "algorithm transparency")

Return ONLY a JSON array of strings, nothing else:
["term 1", "term 2", "term 3"]`;

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
    let { userId } = await auth();
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate Limiting
    const rateLimit = await checkRateLimit(userId); // Uses default 25 requests per minute
    if (!rateLimit.success) {
        return NextResponse.json(
            { error: rateLimit.error || "Too Many Requests" },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': rateLimit.limit.toString(),
                    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                    'X-RateLimit-Reset': rateLimit.reset.toString()
                }
            }
        );
    }


    try {
        const body = await request.json();
        const { policyText, customQuery, platforms } = body;
        console.log(`DEBUG: Received request. PolicyText length: ${policyText?.length}, Query: ${customQuery}`);

        // Generate cache key
        const cacheKey = `user:${userId}:search-traces-v13-classified:${Buffer.from(JSON.stringify({ policyText: policyText?.slice(0, 100), customQuery, platforms })).toString('base64')}`;

        // Check cache
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log('Returning cached search traces');
                return NextResponse.json(JSON.parse(cachedData));
            }
        } catch (error) {
            console.error('Redis cache check failed:', error);
        }

        // Check for required API keys
        const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
        const searchEngineId = process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_SEARCH_ENGINE_ID;
        const openaiApiKey = process.env.OPENAI_API_KEY;

        if (!googleApiKey || !searchEngineId) {
            return NextResponse.json(
                {
                    error: 'Google Search API not configured',
                    details: 'Please add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX to .env.local'
                },
                { status: 500 }
            );
        }

        let searchQueries: string[] = [];

        // If custom query provided, use it directly
        if (customQuery && customQuery.trim()) {
            searchQueries = [customQuery.trim()];
        }
        // Otherwise, extract key terms from policy text
        else if (policyText) {
            if (!openaiApiKey) {
                return NextResponse.json(
                    { error: 'OpenAI API key required for automatic term extraction' },
                    { status: 500 }
                );
            }

            const openai = new OpenAI({ apiKey: openaiApiKey });

            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: KEY_TERM_EXTRACTION_PROMPT },
                    { role: 'user', content: `POLICY TEXT:\n${policyText.substring(0, 3000)}` }
                ],
                temperature: 0.3,
                max_tokens: 200,
            });

            const responseText = completion.choices[0]?.message?.content || '';
            try {
                searchQueries = JSON.parse(responseText);
            } catch {
                // Fallback if parsing fails
                searchQueries = ['AI policy resistance', 'algorithm criticism'];
            }
        } else {
            return NextResponse.json(
                { error: 'Either policyText or customQuery must be provided' },
                { status: 400 }
            );
        }

        // Ensure we have at least one broad query to catch news/social results
        searchQueries.push("AI policy controversy");
        console.log("Search Queries:", searchQueries);
        console.log("Platforms:", platforms);

        // Construct platform-specific queries
        const platformFilters = platforms || ['reddit', 'hackernews', 'forums'];
        const allTraces: Trace[] = [];

        for (const query of searchQueries.slice(0, 2)) { // Limit to 2 queries
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
            const aiApiKey = process.env.GOOGLE_API_KEY;
            if (!aiApiKey) {
                console.error("AI API key missing for curation.");
            } else {
                console.log("Starting AI Curation Service...");
                // Convert Traces back to SearchResult format for service
                const searchResults: SearchResult[] = allTraces.map(t => ({
                    title: t.title,
                    link: t.sourceUrl,
                    snippet: t.content
                }));

                // Use Policy Text or clean Custom Query as the "Subject"
                let policySubject = "AI Resistance";
                if (policyText) {
                    policySubject = policyText.substring(0, 100).split('\n')[0];
                } else if (customQuery) {
                    policySubject = customQuery;
                }

                const curatedResults = await curateResultsWithAI(searchResults, policySubject, aiApiKey);

                // Merge curation back into Traces
                finalTraces = curatedResults.map(curated => {
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
            }
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
            await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60 * 24);
        } catch (error) {
            console.error('Failed to cache search traces:', error);
        }

        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error('Search error:', error);
        return NextResponse.json(
            {
                error: 'Search failed',
                details: (error as Error).message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
