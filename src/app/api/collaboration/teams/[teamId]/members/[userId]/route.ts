import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { CollaborationService } from '@/services/collaboration-service';
import { createErrorResponse, createUnauthorizedResponse } from '@/lib/api-helpers';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { teamId: string; userId: string } }
) {
    try {
        const currentUserId = await getAuthenticatedUserId(req);
        if (!currentUserId) return createUnauthorizedResponse();

        const { teamId, userId: targetUserId } = params;

        // 1. Authorization: Only owners can remove members
        const access = await validateWorkspaceAccess(currentUserId, teamId);
        if (!access.allowed || access.role !== 'OWNER') {
            return NextResponse.json({ error: 'Only team owners can remove members' }, { status: 403 });
        }

        // 2. Prevent removing yourself (use leave team endpoint instead)
        if (currentUserId === targetUserId) {
            return NextResponse.json({ error: 'Use leave team endpoint to remove yourself' }, { status: 400 });
        }

        // 3. Remove member
        await CollaborationService.removeMember(teamId, targetUserId);

        return NextResponse.json({ success: true });
    } catch (error) {
        return createErrorResponse(error);
    }
}
