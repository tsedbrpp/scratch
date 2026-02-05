import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { CollaborationService } from '@/services/collaboration-service';
import { createErrorResponse, createUnauthorizedResponse } from '@/lib/api-helpers';

export async function GET(
    req: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const userId = await getAuthenticatedUserId(req);
        if (!userId) return createUnauthorizedResponse();

        const { teamId } = await params;

        // Debug logging
        console.log('[Team Access Check]', {
            userId,
            teamId,
            timestamp: new Date().toISOString()
        });

        // 1. Verify user has access to this team
        const isMember = await CollaborationService.isTeamMember(teamId, userId);

        console.log('[Team Access Result]', {
            userId,
            teamId,
            isMember,
            timestamp: new Date().toISOString()
        });

        if (!isMember) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // 2. Get team details
        const teamInfo = await CollaborationService.getTeamInfo(teamId);
        if (!teamInfo) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // 3. Get team members
        const members = await CollaborationService.getTeamMembers(teamId);

        return NextResponse.json({
            ...teamInfo,
            members
        });
    } catch (error) {
        return createErrorResponse(error);
    }
}
