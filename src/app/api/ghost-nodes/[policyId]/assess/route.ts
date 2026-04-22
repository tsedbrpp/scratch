import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';
import { GhostNodeStore } from '@/lib/ghost-node-store';
import { AnalystAssessment } from '@/lib/ghost-nodes/types';

/**
 * PATCH /api/ghost-nodes/[policyId]/assess
 * Updates the analyst's reflexive assessment on a specific Ghost Node.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ policyId: string }> }
) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workspaceId = request.headers.get('x-workspace-id');
        const contextId = workspaceId || userId;

        const access = await validateWorkspaceAccess(userId, contextId);
        if (!access.allowed) {
            return NextResponse.json({ error: "Forbidden: Access Denied to Workspace" }, { status: 403 });
        }

        const resolvedParams = await params;
        const { policyId } = resolvedParams;
        if (!policyId) {
            return NextResponse.json({ error: "Missing policyId" }, { status: 400 });
        }

        const body = await request.json();
        const { fingerprint, assessment } = body as {
            fingerprint: string;
            assessment: AnalystAssessment;
        };

        if (!fingerprint || !assessment) {
            return NextResponse.json({ error: "Missing fingerprint or assessment" }, { status: 400 });
        }

        // Ensure timestamp and analyst ID
        const enrichedAssessment: AnalystAssessment = {
            ...assessment,
            assessedAt: new Date().toISOString(),
            assessedBy: userId,
        };

        const success = await GhostNodeStore.updateGhostNodeAssessment(
            contextId,
            policyId,
            fingerprint,
            enrichedAssessment
        );

        if (!success) {
            return NextResponse.json({ error: "Ghost node not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, assessment: enrichedAssessment });
    } catch (error) {
        console.error('Failed to update ghost node assessment:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
