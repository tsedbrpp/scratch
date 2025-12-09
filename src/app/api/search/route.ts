import { NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
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
                const modelName = process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash";
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = `You are analyzing an AI governance policy document to find EMPIRICAL TRACES of real-world resistance, impacts, and micro-practices.

Policy Document Excerpt:
"${policyText.substring(0, 3000)}"

Your task: Generate 1-2 highly specific search queries to find:
1. Real people discussing how this policy affects them (workers, users, communities)
2. Evidence of resistance strategies (workarounds, refusals, collective action)
3. Concrete examples of policy implementation challenges or failures
4. Forum posts, Reddit threads, or social media discussions about lived experiences

IMPORTANT RULES:
- Focus on SPECIFIC stakeholders (e.g., "gig workers", "content moderators", "AI developers")
- Include action words (e.g., "resist", "workaround", "protest", "experience")
- Avoid generic terms like "AI regulation" or "policy discussion"
- Target platforms where affected people actually discuss issues (Reddit, forums, social media)
- Look for CONTROVERSIAL or SPECIFIC terms in the text (e.g., "biometric categorization", "emotion recognition", "predictive policing") and combine them with "reddit" or "forum"

GOOD EXAMPLES:
- "uber drivers algorithm manipulation reddit"
- "content moderators AI moderation burnout"
- "facial recognition protest community resistance"
- "biometric surveillance workplace complaint forum"

BAD EXAMPLES:
- "AI regulation" (too broad)
- "EU AI Act" (just the policy name)
- "artificial intelligence governance" (academic, not empirical)

Return ONLY a JSON array of 1-2 search queries, no markdown:
["specific query 1", "specific query 2"]`;

                const result = await model.generateContent(prompt);
                const response = result.response;
                const content = response.text().trim();

                // Parse the JSON response (handle potential markdown wrapping)
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                const searchTerms = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

                if (Array.isArray(searchTerms) && searchTerms.length > 0) {
                    searchQuery = searchTerms[0]; // Use the first search term
                } else {
                    return NextResponse.json(
                        { success: false, error: 'Failed to generate search terms from policy text' },
                        { status: 400 }
                    );
                }
            } catch (aiError) {
                console.error('AI search term generation error:', aiError);
                return NextResponse.json(
                    { success: false, error: 'Failed to generate search terms' },
                    { status: 500 }
                );
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

        if (!googleApiKey || !cx) {
            return NextResponse.json(
                { success: false, error: 'Google Search API configuration missing. Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX in .env.local' },
                { status: 500 }
            );
        }

        // Enhance query with site-specific operators to target empirical discussion platforms
        // This helps filter out news articles and academic papers in favor of real discussions
        const enhancedQuery = `${searchQuery} (site:reddit.com OR site:news.ycombinator.com OR site:*.stackexchange.com OR inurl:forum OR inurl:discussion)`;

        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${cx}&q=${encodeURIComponent(enhancedQuery)}&num=${Math.min(maxResults, 10)}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (!response.ok) {
            console.error('Google Search API Error:', data);
            return NextResponse.json(
                { success: false, error: data.error?.message || 'Failed to fetch search results' },
                { status: response.status }
            );
        }

        const results = data.items?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        })) || [];

        return NextResponse.json({
            success: true,
            results,
            searchQuery // Return the query that was used
        });

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
