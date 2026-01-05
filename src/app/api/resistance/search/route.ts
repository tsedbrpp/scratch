import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source: string;
    date: string;
    type: 'manifesto' | 'policy_draft' | 'social_media' | 'protest_material' | 'interview' | 'other';
}

// Fallback verified data
const MOCK_RESULTS: SearchResult[] = [
    {
        title: "EFF: EU AI Act Passed: Now the Hard Work Begins",
        url: "https://www.eff.org/deeplinks/2024/03/eu-ai-act-passed-now-hard-work-begins",
        snippet: "The European Parliament has voted to adopt the AI Act. Here is the EFF's analysis of the final text and what comes next for fundamental rights.",
        source: "Electronic Frontier Foundation",
        date: "2024-03-13",
        type: "manifesto"
    },
    {
        title: "EFF: EU AI Act Deal Reached: Human Rights Still at Risk",
        url: "https://www.eff.org/deeplinks/2023/12/eu-ai-act-deal-reached-human-rights-still-risk",
        snippet: "Civil society reacts to the final political deal on the AI Act, highlighting significant loopholes for law enforcement and national security.",
        source: "Electronic Frontier Foundation",
        date: "2023-12-09",
        type: "policy_draft"
    },
    {
        title: "TechCrunch: EU ties up deal on AI Act",
        url: "https://techcrunch.com/2023/12/08/eu-ai-act-deal/",
        snippet: "Analysis of the marathon negotiations that led to the world's first comprehensive AI law.",
        source: "TechCrunch",
        date: "2023-12-08",
        type: "social_media"
    }
];

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;

    // 1. Fallback if no keys configured
    if (!apiKey || !cx) {
        console.warn("Google Search API keys missing. Returning mock data.");
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));
        return NextResponse.json({
            results: MOCK_RESULTS,
            source: 'mock',
            message: 'API keys not configured. Showing verified demo data.'
        });
    }

    // 2. Real Search
    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Google API Error');
        }

        if (!data.items) {
            return NextResponse.json({ results: [], source: 'google' });
        }

        const mappedResults: SearchResult[] = data.items.map((item: any) => ({
            title: item.title,
            url: item.link || '',
            snippet: item.snippet,
            source: item.displayLink || new URL(item.link).hostname,
            date: new Date().toISOString().split('T')[0], // Google API doesn't always return date, default to today or extract if possible
            type: 'other' // Search results lack semantic type, default to other
        }));

        return NextResponse.json({ results: mappedResults, source: 'google' });

    } catch (error) {
        console.error("Google Search failed:", error);
        // Fallback to mock on error to keep UI usable
        return NextResponse.json({
            results: MOCK_RESULTS,
            source: 'mock_fallback',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
