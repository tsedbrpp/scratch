import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { CollaborationService } from '@/services/collaboration-service';
import { createErrorResponse, createUnauthorizedResponse } from '@/lib/api-helpers';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const userId = await getAuthenticatedUserId(req);
        if (!userId) return createUnauthorizedResponse();

        const { teamId } = await params;

        console.log('[Delete Team Request]', {
            userId,
            teamId,
            timestamp: new Date().toISOString()
        });

        // Verify ownership via validateWorkspaceAccess
        const access = await validateWorkspaceAccess(userId, teamId);
        if (!access.allowed || access.role !== 'OWNER') {
            return NextResponse.json(
                { error: 'Only team owners can delete teams' },
                { status: 403 }
            );
        }

        // Delete team and get member list
        const result = await CollaborationService.deleteTeam(teamId, userId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        console.log('[Delete Team Success]', {
            teamId,
            teamName: result.teamName,
            memberCount: result.members?.length,
            timestamp: new Date().toISOString()
        });

        // TODO: Send notifications to members
        // Future enhancement: await NotificationService.teamDeleted(teamId, result.members);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return createErrorResponse(error);
    }
}
