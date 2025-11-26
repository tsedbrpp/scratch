import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';

const KEY_TERM_EXTRACTION_PROMPT = `You are an expert researcher analyzing policy documents to identify key terms for web searches.

Your task is to extract 3-5 specific, searchable terms or phrases from the policy text that would help find real-world discussions about resistance, criticism, or adaptation to this policy.

Focus on:
- Specific mechanisms or requirements (e.g., "facial recognition ban", "high-risk AI systems")
- Controversial or burdensome aspects
- Terms that affected communities would use (e.g., "gig worker surveillance", "algorithm transparency")

Return ONLY a JSON array of strings, nothing else:
["term 1", "term 2", "term 3"]`;

interface SearchResult {
    title: string;
    snippet: string;
    link: string;
    displayLink: string;
}

interface GoogleSearchResponse {
    items?: SearchResult[];
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { policyText, customQuery, platforms } = body;

        // Generate cache key
        const cacheKey = `search-traces:${Buffer.from(JSON.stringify({ policyText: policyText?.slice(0, 100), customQuery, platforms })).toString('base64')}`;

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

        // Construct platform-specific queries
        const platformFilters = platforms || ['reddit', 'hackernews', 'forums'];
        const allTraces: any[] = [];

        for (const query of searchQueries.slice(0, 2)) { // Limit to 2 queries to save API quota
            for (const platform of platformFilters) {
                let siteQuery = query;

                if (platform === 'reddit') {
                    siteQuery = `site:reddit.com ${query}`;
                } else if (platform === 'hackernews') {
                    siteQuery = `site:news.ycombinator.com ${query}`;
                } else if (platform === 'forums') {
                    // Search general forums
                    siteQuery = `${query} forum OR discussion`;
                }

                // Call Google Custom Search API
                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(siteQuery)}&num=3`;

                const response = await fetch(searchUrl);
                const data: GoogleSearchResponse = await response.json();

                if (data.items) {
                    for (const item of data.items) {
                        allTraces.push({
                            title: item.title,
                            description: `From ${item.displayLink}`,
                            content: item.snippet,
                            sourceUrl: item.link,
                            platform: platform,
                            query: query
                        });
                    }
                }
            }
        }

        const result = {
            success: true,
            traces: allTraces,
            queriesUsed: searchQueries.slice(0, 2)
        };

        // Cache result (expire in 24 hours)
        try {
            await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60 * 24);
        } catch (error) {
            console.error('Failed to cache search traces:', error);
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json(
            {
                error: 'Search failed',
                details: error.message
            },
            { status: 500 }
        );
    }
}
