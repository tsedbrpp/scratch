import { NextRequest, NextResponse } from 'next/server';
import { updateSource, deleteSource } from '@/lib/store';
import { getAuthenticatedUserId, isReadOnlyAccess } from '@/lib/auth-helper';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Updates disabled in Demo Mode" }, { status: 403 });
    }

    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Use workspace ID if provided (for team workspaces), otherwise use user ID
    const workspaceId = request.headers.get('x-workspace-id') || userId;

    try {
        const { id } = await params;
        console.log(`[API] PUT /sources/${id} - Attempting update for Workspace: ${workspaceId} (User: ${userId})`);

        const body = await request.json();
        const updatedSource = await updateSource(workspaceId, id, body);

        if (!updatedSource) {
            console.error(`[API] Source not found for Workspace: ${workspaceId}, SourceID: ${id}`);
            // Verification: Log available source IDs for this workspace to see if it exists
            const { getSources } = await import('@/lib/store');
            const existing = await getSources(workspaceId);
            console.log(`[API] Workspace ${workspaceId} has ${existing.length} sources. IDs: ${existing.map((s: any) => s.id).join(', ')}`);

            return NextResponse.json({ error: 'Source not found' }, { status: 404 });
        }

        return NextResponse.json(updatedSource);
    } catch (error: unknown) {
        console.error('Update source error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to update source: ${errorMessage}` }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Deletion disabled in Demo Mode" }, { status: 403 });
    }

    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Use workspace ID if provided (for team workspaces), otherwise use user ID
    const workspaceId = request.headers.get('x-workspace-id') || userId;

    try {
        const { id } = await params;
        console.log(`[API] DELETE /sources/${id} - Attempting deletion for Workspace: ${workspaceId} (User: ${userId})`);

        await deleteSource(workspaceId, id);
        return new NextResponse(null, { status: 204 });
    } catch (error: unknown) {
        console.error('Delete source error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to delete source: ${errorMessage}` }, { status: 500 });
    }
}
