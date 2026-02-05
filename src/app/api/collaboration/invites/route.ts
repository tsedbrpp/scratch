import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { CollaborationService } from '@/services/collaboration-service';
import { createErrorResponse, createUnauthorizedResponse } from '@/lib/api-helpers';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        if (!userId) return createUnauthorizedResponse();

        const body = await req.json();
        const { teamId, email, role } = body;

        console.log('[Create Invitation]', {
            userId,
            teamId,
            email,
            role,
            timestamp: new Date().toISOString()
        });

        if (!teamId || !email) {
            return NextResponse.json({ error: "Missing Team ID or Email" }, { status: 400 });
        }

        // 1. Authorization: Only Owners (or maybe Editors in future) can invite.
        // We use our new Middleware Logic (or manual check since we are inside a route)
        // Since validateWorkspaceAccess is a helper, we can use it.
        const access = await validateWorkspaceAccess(userId, teamId);

        console.log('[Invitation Auth Check]', {
            userId,
            teamId,
            access,
            timestamp: new Date().toISOString()
        });

        if (!access.allowed || access.role !== 'OWNER') {
            // Only Owners can invite for MVP
            return NextResponse.json({ error: "Only Team Owners can invite members." }, { status: 403 });
        }

        // 2. Create Invite
        const result = await CollaborationService.createInvitation(teamId, userId, email, role || 'EDITOR');

        return NextResponse.json(result);
    } catch (error) {
        return createErrorResponse(error);
    }
}
