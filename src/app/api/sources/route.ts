import { NextRequest, NextResponse } from 'next/server';
import { getSources, addSource } from '@/lib/store';
import { getAuthenticatedUserId, isReadOnlyAccess } from '@/lib/auth-helper';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';

// Helper to resolve effective context
async function getEffectiveContext(req: NextRequest, userId: string) {
    const workspaceId = req.headers.get('x-workspace-id');

    // Default to Personal Workspace if no header
    const targetContext = workspaceId || userId;

    const access = await validateWorkspaceAccess(userId, targetContext);

    if (!access.allowed) {
        throw new Error('Access Denied to Workspace');
    }

    // Return the Context ID (Team ID or User ID) to use for storage
    return { contextId: targetContext, role: access.role };
}

export async function GET(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { contextId } = await getEffectiveContext(request, userId);
        const sources = await getSources(contextId);
        return NextResponse.json(sources);
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown Error';
        if (msg === 'Access Denied to Workspace') return new NextResponse("Forbidden", { status: 403 });
        return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Uploads disabled in Demo Mode" }, { status: 403 });
    }

    const userId = await getAuthenticatedUserId(request);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { contextId, role } = await getEffectiveContext(request, userId);

        // RBAC: Viewers cannot create sources
        if (role === 'VIEWER') {
            return NextResponse.json({ error: "Viewers cannot upload sources" }, { status: 403 });
        }

        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Payload too large (Max 10MB)' }, { status: 413 });
        }

        const body = await request.json();
        // Pass contextId where userId used to go
        const newSource = await addSource(contextId, body);
        return NextResponse.json(newSource);
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown Error';
        if (msg === 'Access Denied to Workspace') return new NextResponse("Forbidden", { status: 403 });
        return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
    }
}
