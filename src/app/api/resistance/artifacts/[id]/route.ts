import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage-service';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { ResistanceArtifact } from '@/types/resistance';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        let artifacts = await StorageService.get<ResistanceArtifact[]>(userId, 'resistance_artifacts');
        if (!artifacts) {
            return NextResponse.json({ error: "No artifacts found" }, { status: 404 });
        }

        const initialLength = artifacts.length;
        artifacts = artifacts.filter(a => a.id !== id);

        if (artifacts.length === initialLength) {
            return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
        }

        await StorageService.set(userId, 'resistance_artifacts', artifacts);

        return NextResponse.json({
            success: true,
            message: 'Artifact deleted'
        });
    } catch (error) {
        console.error('Error deleting artifact:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete artifact' },
            { status: 500 }
        );
    }
}
