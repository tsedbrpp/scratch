import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { CollaborationService } from '@/services/collaboration-service';
import { createErrorResponse, createUnauthorizedResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        if (!userId) return createUnauthorizedResponse();

        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: "Missing Invitation Token" }, { status: 400 });
        }

        const result = await CollaborationService.acceptInvitation(userId, token);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, teamId: result.teamId });
    } catch (error) {
        return createErrorResponse(error);
    }
}
