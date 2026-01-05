import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ResistanceArtifact } from '@/types/resistance';
import { StorageService } from '@/lib/storage-service';
import { getAuthenticatedUserId } from '@/lib/auth-helper';

/**
 * GET /api/resistance/artifacts
 * List all resistance artifacts
 */
export async function GET(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const artifacts = await StorageService.get<ResistanceArtifact[]>(userId, 'resistance_artifacts');

        return NextResponse.json({
            success: true,
            artifacts: artifacts || []
        });
    } catch (error) {
        console.error('Error fetching resistance artifacts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch artifacts' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/resistance/artifacts
 * Create a new resistance artifact
 */
export async function POST(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Create new artifact with metadata
        const newArtifact: ResistanceArtifact = {
            id: uuidv4(),
            ...body,
            uploaded_by: userId,
            uploaded_at: new Date().toISOString(),
        };

        // Get existing artifacts
        let artifacts = await StorageService.get<ResistanceArtifact[]>(userId, 'resistance_artifacts');
        if (!artifacts) artifacts = [];

        // Add new artifact
        artifacts.push(newArtifact);

        // Save back to Redis
        await StorageService.set(userId, 'resistance_artifacts', artifacts);

        return NextResponse.json({
            success: true,
            artifact: newArtifact
        });
    } catch (error) {
        console.error('Error creating resistance artifact:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create artifact' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/resistance/artifacts
 * Delete all resistance artifacts (for testing)
 */
export async function DELETE(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await StorageService.delete(userId, 'resistance_artifacts');

        return NextResponse.json({
            success: true,
            message: 'All artifacts deleted'
        });
    } catch (error) {
        console.error('Error deleting resistance artifacts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete artifacts' },
            { status: 500 }
        );
    }
}
