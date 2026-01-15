import { NextResponse } from 'next/server';
import { executeGoogleSearch, curateResultsWithAI, getMockResults, SearchResult } from '@/lib/search-service';
import { auth } from '@clerk/nextjs/server';
import { isReadOnlyAccess } from '@/lib/auth-helper';

export async function POST(req: Request) {
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Demo Search is Disabled", success: false }, { status: 403 });
    }

    let { userId } = await auth();

    // Check for demo user if not authenticated
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = req.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        const { query, policyText, maxResults = 5 } = await req.json();

        // Determine the search query
        let searchQuery = query;

        // If policyText is provided but no query, generate search terms from the policy text
        if (!searchQuery && policyText) {
            const apiKey = process.env.GOOGLE_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: 'Google API key not configured for search term generation. Please set GOOGLE_API_KEY in .env.local' },
                    { status: 500 }
                );
            }

            try {
                const { GoogleGenerativeAI } = await import('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(apiKey);
                const modelName = process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash-latest";
                const model = genAI.getGenerativeModel({ model: modelName });

                // EXTRACT SUBJECT ENTITY FIRST (Crucial for relevance)
                // We use the AI to determine exactly WHAT this policy is about (e.g. "European AI Act", "Uber Driver App")
                // This prevents generic "AI" searches or cross-contamination.
                const subjectPrompt = `Identify the SPECIFIC Policy, Act, Bill, Platform, or Company this text describes. 
                Text: "${policyText.substring(0, 1000)}"
                Return ONLY the name (e.g. "EU AI Act"). If unclear, return "AI Governance Policy".`;

                const subjectResult = await model.generateContent(subjectPrompt);
                const policySubject = subjectResult.response.text().trim().replace(/['"]/g, '');
                console.log("Extracted Policy Subject:", policySubject);

                const prompt = `You are an expert investigative researcher. 
Your goal is to find real-world discussions about: "${policySubject}".

TASK:
Generate 2 very precise Google Search queries.

RULES:
1. **Identify the Subject**: ALWAYS include the name "${policySubject}" in every query.
2. **FORCE Resistance Keywords**: You MUST include at least one resistance-specific term in EVERY query to find behavioral adaptations. Use terms like: "workaround", "bypass", "trick", "cheat", "exploit", "jailbreak", "strike", "protest", "loophole", "refusal".
3. **Target Empirical Forums**: Combine these with "reddit", "forum", "discussion" to find lived experiences.
4. **Avoid Generalities**: Do NOT use generic terms like "challenges" or "issues". Use "failure", "glitch", "harm".

OUTPUT FORMAT:
Return ONLY a JSON array of strings.
Example: ["${policySubject} workaround reddit", "${policySubject} bypass trick forum"]

["Query 1", "Query 2"]`;

                const result = await model.generateContent(prompt);
                const response = result.response;
                const content = response.text().trim();

                // Parse the JSON response (handle potential markdown wrapping)
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                const searchTerms = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

                if (Array.isArray(searchTerms) && searchTerms.length > 0) {
                    searchQuery = searchTerms[0]; // Use the first search term
                } else {
                    console.warn('Failed to parse search terms, falling back.');
                }
            } catch (aiError) {
                console.error('AI search term generation error:', aiError);
                // Fallback: Try to extract potential title
                const firstLine = policyText.split('\n')[0].substring(0, 100);
                const fallbackQuery = (firstLine.length < 50 ? firstLine : firstLine.split(' ').slice(0, 6).join(' ')) + " resistance";
                searchQuery = fallbackQuery;
                console.log('Falling back to basic query:', searchQuery);
            }
        }

        if (!searchQuery) {
            return NextResponse.json(
                { success: false, error: 'Either query or policyText is required' },
                { status: 400 }
            );
        }

        const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
        const cx = process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_SEARCH_ENGINE_ID;
        const aiApiKey = process.env.GOOGLE_API_KEY;

        // MOCK FALLBACK: If keys are missing, return realistic mock data
        if (!googleApiKey || !cx || !aiApiKey) {
            console.warn("Google Search/AI keys missing. Returning MOCK results.");
            return NextResponse.json({
                success: true,
                results: getMockResults(searchQuery),
                searchQuery,
                isMock: true
            });
        }

        // AGGREGATION STRATEGY: Run multiple variations to maximize yield
        const strictQuery = `${searchQuery} (site:reddit.com OR site:news.ycombinator.com OR site:*.stackexchange.com OR site:x.com OR site:twitter.com OR site:medium.com OR site:substack.com OR inurl:forum OR inurl:discussion)`;
        const relaxedQuery = `${searchQuery} discussion opinion experience problem`;

        // Typology Queries
        const techniqueQuery = `${searchQuery} workaround bypass hack trick jailbreak spoof`;
        const collectiveQuery = `${searchQuery} strike union protest boycott refused banned quit`;

        console.log("Running parallel search strategies via SearchService...");
        const [strictResults, relaxedResults, techniqueResults, collectiveResults] = await Promise.all([
            executeGoogleSearch(strictQuery, googleApiKey, cx),
            executeGoogleSearch(relaxedQuery, googleApiKey, cx),
            executeGoogleSearch(techniqueQuery, googleApiKey, cx),
            executeGoogleSearch(collectiveQuery, googleApiKey, cx)
        ]);

        // Merge and Deduplicate by Link
        const allRawResults = [...strictResults, ...techniqueResults, ...collectiveResults, ...relaxedResults];
        const uniqueMap = new Map<string, SearchResult>();
        allRawResults.forEach(r => {
            if (!uniqueMap.has(r.link)) uniqueMap.set(r.link, r);
        });

        const results = Array.from(uniqueMap.values());
        console.log(`Aggregated ${results.length} unique raw results.`);

        // Final check for empty
        if (results.length === 0) {
            return NextResponse.json({
                success: true,
                results: [],
                searchQuery
            });
        }

        // AI CURATION STEP using Service
        console.log("Starting AI Curation Service...");
        const curatedResults = await curateResultsWithAI(results, policyText, aiApiKey);

        return NextResponse.json({
            success: true,
            results: curatedResults,
            searchQuery
        });

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}


