
import { NextRequest, NextResponse } from 'next/server';
import { executeGoogleSearch } from '@/lib/search-service';

export async function POST(request: NextRequest) {
    try {
        const { actorName, context } = await request.json();

        if (!actorName) {
            return NextResponse.json({ error: "Actor name is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        const cx = process.env.GOOGLE_SEARCH_CX;

        if (!apiKey || !cx) {
            return NextResponse.json({ error: "Google Search not configured" }, { status: 501 });
        }

        // Construct a query that favors official stats
        const query = `"${actorName}" ${context || 'official website home page'}`;

        const results = await executeGoogleSearch(query, apiKey, cx, 3);

        if (results && results.length > 0) {
            // Return variables for the first result
            return NextResponse.json({
                success: true,
                url: results[0].link,
                title: results[0].title
            });
        }

        return NextResponse.json({ success: false, message: "No results found" });

    } catch (error: any) {
        console.error("[Enrichment Error]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
