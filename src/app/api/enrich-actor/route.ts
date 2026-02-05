
import { NextRequest, NextResponse } from 'next/server';
import { executeGoogleSearch } from '@/lib/search-service';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validate Workspace Access (optional for pure search, but good for rate limiting/billing context)
        const workspaceId = request.headers.get('x-workspace-id');
        if (workspaceId) {
            const access = await validateWorkspaceAccess(userId, workspaceId);
            if (!access.allowed) {
                return NextResponse.json({ error: "Access Denied to Workspace" }, { status: 403 });
            }
        }

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

    } catch (error: unknown) {
        console.error("[Enrichment Error]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
