import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage-service';
import { isReadOnlyAccess, getAuthenticatedUserId } from '@/lib/auth-helper';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';

// Helper to resolve effective context
async function getEffectiveContext(req: NextRequest) {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return { error: { message: "Unauthorized", status: 401 }, status: 401 };

    const workspaceId = req.headers.get('x-workspace-id');
    const targetContext = workspaceId || userId;

    const access = await validateWorkspaceAccess(userId, targetContext);

    if (!access.allowed) {
        return { error: { message: "Access Denied", status: 403 }, status: 403 };
    }

    return { userId, contextId: targetContext, role: access.role };
}

export async function GET(request: NextRequest) {
    const ctx = await getEffectiveContext(request);
    if (ctx.error) return NextResponse.json({ error: ctx.error.message }, { status: ctx.status });
    const { contextId } = ctx;

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
        return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    try {
        const data = await StorageService.get(contextId, key);
        return NextResponse.json({ value: data });
    } catch (error) {
        console.error('Failed to fetch storage item:', error);
        return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // Block write operations in Read-Only / Demo Mode
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Storage updates disabled in Demo Mode" }, { status: 403 });
    }

    const ctx = await getEffectiveContext(request);
    if (ctx.error) return NextResponse.json({ error: ctx.error.message }, { status: ctx.status });
    const { contextId, role } = ctx;

    // RBAC: Viewers cannot write to storage
    if (role === 'VIEWER') {
        return NextResponse.json({ error: "Viewers cannot modify storage" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        await StorageService.set(contextId, key, value);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save storage item:', error);
        return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
    }
}
