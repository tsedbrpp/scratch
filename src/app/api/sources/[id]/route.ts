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
    try {
        const { id } = await params;
        console.log(`[API] PUT /sources/${id} - Attempting update for User: ${userId}`);

        const body = await request.json();
        const updatedSource = await updateSource(userId, id, body);

        if (!updatedSource) {
            console.error(`[API] Source not found for User: ${userId}, SourceID: ${id}`);
            // Verification: Log available source IDs for this user to see if it exists
            // This is expensive but useful for debugging this specific error
            const { getSources } = require('@/lib/store');
            const existing = await getSources(userId);
            console.log(`[API] User ${userId} has ${existing.length} sources. IDs: ${existing.map((s: any) => s.id).join(', ')}`);

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
    try {
        const { id } = await params;
        const success = await deleteSource(userId, id);

        if (!success) {
            return NextResponse.json({ error: 'Source not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete source failed:', error);
        return NextResponse.json({ error: `Failed to delete source: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
}
