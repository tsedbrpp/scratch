import { NextRequest, NextResponse } from 'next/server';
import { CollaborationService } from '@/services/collaboration-service';
import { createErrorResponse } from '@/lib/api-helpers';

export async function GET(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = params;

        const details = await CollaborationService.getInviteDetails(token);

        if (!details) {
            return NextResponse.json(
                { error: 'Invitation expired or invalid' },
                { status: 410 }
            );
        }

        return NextResponse.json(details);
    } catch (error) {
        return createErrorResponse(error);
    }
}
