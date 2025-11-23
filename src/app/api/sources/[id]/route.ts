import { NextResponse } from 'next/server';
import { updateSource, deleteSource } from '@/lib/store';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updatedSource = await updateSource(id, body);

        if (!updatedSource) {
            return NextResponse.json({ error: 'Source not found' }, { status: 404 });
        }

        return NextResponse.json(updatedSource);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update source' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await deleteSource(id);

        if (!success) {
            return NextResponse.json({ error: 'Source not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
    }
}
