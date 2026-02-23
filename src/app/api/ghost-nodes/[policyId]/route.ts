import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';
import { GhostNodeStore } from '@/lib/ghost-node-store';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ policyId: string }> }
) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workspaceId = request.headers.get('x-workspace-id');
        const contextId = workspaceId || userId;

        const access = await validateWorkspaceAccess(userId, contextId);
        if (!access.allowed) {
            return NextResponse.json({ error: "Forbidden: Access Denied to Workspace" }, { status: 403 });
        }

        const resolvedParams = await params;
        const { policyId } = resolvedParams;
        if (!policyId) {
            return NextResponse.json({ error: "Missing policyId" }, { status: 400 });
        }

        const ghostNodes = await GhostNodeStore.getGhostNodes(contextId, policyId);

        return NextResponse.json({ success: true, ghostNodes }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });
    } catch (error) {
        console.error('Failed to fetch ghost nodes:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
