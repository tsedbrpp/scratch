import { NextRequest, NextResponse } from 'next/server';
import { isReadOnlyAccess } from '@/lib/auth-helper';

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source: string;
    date: string;
    type: 'manifesto' | 'policy_draft' | 'social_media' | 'protest_material' | 'interview' | 'other';
}

// Fallback verified data
const MOCK_RESULTS: SearchResult[] = [];

export async function GET(request: NextRequest) {
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Demo Search is Disabled" }, { status: 403 });
    }

    // Since this is a POST for search, we expect a body with a query
    // But the existing code was GET-based (reading query params).
    // The previous instructions implied converting to POST for consistency or adding check to GET.
    // However, existing client likely uses POST for main search but maybe GET for this specific resistance search?
    // Let's check if the client uses POST or GET. Currently the file has `export async function GET`.
    // If I change it to POST, I might break the client.
    // BUT the requirement was to block "write/costly" operations. Search is costly.
    // I will keep it as GET if that's what it was, OR switch to POST if I'm sure.
    // The previous file content shows `export async function GET`.
    // I should add the check to GET as well.
    // AND the previous file had a try/catch block that was malformed.

    // Let's stick to GET as per the file I viewed, but add the check.
    // Wait, the `isReadOnlyAccess` check blocks costly operations.
    // If I block GET, the client needs to handle 403.

    // Re-reading code: The file I viewed (Step 18493) had `export async function GET`.
    // So I will implement GET.

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedResults: SearchResult[] = data.items.map((item: any) => ({
            title: item.title,
            url: item.link || '',
            snippet: item.snippet,
            source: item.displayLink || new URL(item.link).hostname,
            date: new Date().toISOString().split('T')[0],
            type: 'other'
        }));

        return NextResponse.json({ results: mappedResults, source: 'google' });
    } catch (error) {
        console.error("Google Search failed:", error);
        return NextResponse.json({
            results: MOCK_RESULTS,
            source: 'mock_fallback',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
