import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ResistanceArtifact } from '@/types/resistance';
import { StorageService } from '@/lib/storage-service';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';
import { getAuthenticatedUserId } from '@/lib/auth-helper';

// Helper to validate access and get context
async function getEffectiveContext(req: NextRequest) {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return { error: { message: "Unauthorized", status: 401 }, status: 401 };

    const workspaceId = req.headers.get('x-workspace-id');
    // Default to Personal Workspace if no header
    const targetContext = workspaceId || userId;

    const access = await validateWorkspaceAccess(userId, targetContext);

    if (!access.allowed) {
        return { error: { message: "Access Denied", status: 403 }, status: 403 };
    }

    return { userId, contextId: targetContext, role: access.role };
}

/**
 * GET /api/resistance/artifacts
 * List all resistance artifacts
 */
export async function GET(request: NextRequest) {
    const ctx = await getEffectiveContext(request);
    if (ctx.error) return NextResponse.json({ error: ctx.error.message }, { status: ctx.status });
    const { contextId } = ctx;

    try {
        const artifacts = await StorageService.get<ResistanceArtifact[]>(contextId, 'resistance_artifacts');

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
    const ctx = await getEffectiveContext(request);
    if (ctx.error) return NextResponse.json({ error: ctx.error.message }, { status: ctx.status });
    const { userId, contextId, role } = ctx;

    // RBAC Check
    if (role === 'VIEWER') {
        return NextResponse.json({ error: "Viewers cannot create artifacts" }, { status: 403 });
    }

    try {
        const body = await request.json();

        // Create new artifact with metadata
        const newArtifact: ResistanceArtifact = {
            id: uuidv4(),
            ...body,
            uploaded_by: userId, // Keep explicit user attribution even in team context
            uploaded_at: new Date().toISOString(),
        };

        // Get existing artifacts (scoped to context)
        let artifacts = await StorageService.get<ResistanceArtifact[]>(contextId, 'resistance_artifacts');
        if (!artifacts) artifacts = [];

        // Add new artifact
        artifacts.push(newArtifact);

        // Save back to Redis (scoped to context)
        await StorageService.set(contextId, 'resistance_artifacts', artifacts);

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
    const ctx = await getEffectiveContext(request);
    if (ctx.error) return NextResponse.json({ error: ctx.error.message }, { status: ctx.status });
    const { contextId, role } = ctx;

    // RBAC Check
    if (role === 'VIEWER') {
        return NextResponse.json({ error: "Viewers cannot delete artifacts" }, { status: 403 });
    }

    try {
        await StorageService.delete(contextId, 'resistance_artifacts');

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
