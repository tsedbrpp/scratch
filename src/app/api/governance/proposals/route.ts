import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { GovernanceProposal } from '@/types/governance';

// Using a Hash for easier ID-based lookups and updates
const PROPOSALS_HASH_KEY = 'governance:proposals:data';

export async function GET() {
    try {
        // Fetch all fields from the hash
        const proposalsMap = await redis.hgetall(PROPOSALS_HASH_KEY);

        // Convert map values (JSON strings) to objects
        const proposals = Object.values(proposalsMap)
            .map(p => JSON.parse(p)) as GovernanceProposal[];

        // Sort by creation date (newest first)
        proposals.sort((a, b) => b.createdAt - a.createdAt);

        return NextResponse.json(proposals);
    } catch (error) {
        console.error('[API] Failed to fetch proposals:', error);
        return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const proposal = await request.json() as GovernanceProposal;

        // Basic validation
        if (!proposal.id || !proposal.title || !proposal.type) {
            return NextResponse.json({ error: 'Invalid proposal data' }, { status: 400 });
        }

        // Save to Hash: Field = ID, Value = JSON
        await redis.hset(PROPOSALS_HASH_KEY, proposal.id, JSON.stringify(proposal));

        return NextResponse.json({ success: true, proposal });
    } catch (error) {
        console.error('[API] Failed to create proposal:', error);
        return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
    }
}

import { getSources, updateSource } from '@/lib/store';
import { getAuthenticatedUserId } from '@/lib/auth-helper';

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        // Resolve User Context for Source updates
        // Note: We cast Request to NextRequest-like if needed, but getAuthenticatedUserId handles it or expects headers
        const userId = await getAuthenticatedUserId(request as any);

        if (!id) {
            return NextResponse.json({ error: 'Proposal ID required' }, { status: 400 });
        }

        // 1. Fetch Proposal to Check for Linked Source
        const proposalJson = await redis.hget(PROPOSALS_HASH_KEY, id);
        if (proposalJson) {
            const proposal = JSON.parse(proposalJson);
            if (proposal.targetSourceId && userId) {
                console.log(`[API] Reverting escalation for source ${proposal.targetSourceId}`);

                // Fetch Sources to find the target
                const sources = await getSources(userId);
                const source = sources.find(s => s.id === proposal.targetSourceId);

                if (source) {
                    // Revert Escalation Status
                    const updatedAnalysis = {
                        ...source.analysis,
                        escalation_status: undefined
                    };

                    await updateSource(userId, source.id, {
                        analysis: updatedAnalysis
                    });
                    console.log(`[API] Source ${source.id} risk status cleared.`);
                } else {
                    console.warn(`[API] Target source ${proposal.targetSourceId} not found for user ${userId}`);
                }
            }
        }

        // 2. Delete Proposal
        const result = await redis.hdel(PROPOSALS_HASH_KEY, id);

        if (result === 0) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, deletedId: id });
    } catch (error) {
        console.error('[API] Failed to delete proposal:', error);
        return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 });
    }
}
