import { NextResponse } from 'next/server';
import { updateSource, deleteSource } from '@/lib/store';

import { auth } from '@clerk/nextjs/server';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        const { id } = await params;
        const body = await request.json();
        const updatedSource = await updateSource(userId, id, body);

        if (!updatedSource) {
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
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
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
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
    }
}
