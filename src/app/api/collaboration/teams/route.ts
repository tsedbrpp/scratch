import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { CollaborationService } from '@/services/collaboration-service';
import { createErrorResponse, createUnauthorizedResponse } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        if (!userId) return createUnauthorizedResponse();

        const teamIds = await CollaborationService.listMyTeams(userId);

        // For MVP, we might want to fetch details (names) for the selector
        // But listMyTeams only returns IDs. We should probably fetch metadata here.
        // Let's optimize this in phase 2, or just do a loop now (N is small, max 5).

        const teams = (await Promise.all(teamIds.map(async (id) => {
            return await CollaborationService.getTeam(id);
        }))).filter(t => t !== null); // Filter out any stale/deleted teams

        return NextResponse.json({ teams });
    } catch (error) {
        return createErrorResponse(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        if (!userId) return createUnauthorizedResponse();

        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: "Invalid Team Name" }, { status: 400 });
        }

        const result = await CollaborationService.createTeam(name, userId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 403 }); // 403 for Quota
        }

        return NextResponse.json(result);
    } catch (error) {
        return createErrorResponse(error);
    }
}
