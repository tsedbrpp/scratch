import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage-service';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { ResistanceArtifact } from '@/types/resistance';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';

// Helper to validate access and get context
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getEffectiveContext(request);
    if (ctx.error) return NextResponse.json({ error: ctx.error.message }, { status: ctx.status });
    const { contextId, role } = ctx;

    if (role === 'VIEWER') {
        return NextResponse.json({ error: "Viewers cannot delete artifacts" }, { status: 403 });
    }

    try {
        const { id } = await params;

        let artifacts = await StorageService.get<ResistanceArtifact[]>(contextId, 'resistance_artifacts');
        if (!artifacts) {
            return NextResponse.json({ error: "No artifacts found" }, { status: 404 });
        }

        const initialLength = artifacts.length;
        artifacts = artifacts.filter(a => a.id !== id);

        if (artifacts.length === initialLength) {
            return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
        }

        await StorageService.set(contextId, 'resistance_artifacts', artifacts);

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
