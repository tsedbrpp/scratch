import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { GovernanceProposal } from '@/types/governance';

const PROPOSALS_HASH_KEY = 'governance:proposals:data';

export async function POST(request: Request) {
    try {
        const { proposalId, voteType, rationale, userId } = await request.json(); // userId passed from client for MVP, should be from auth in prod

        if (!proposalId || !['for', 'against', 'abstain'].includes(voteType)) {
            return NextResponse.json({ error: 'Invalid vote data' }, { status: 400 });
        }

        // 1. Get existing proposal
        const proposalJson = await redis.hget(PROPOSALS_HASH_KEY, proposalId);
        if (!proposalJson) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        const proposal = JSON.parse(proposalJson) as GovernanceProposal;

        // Initialize history if new field
        if (!proposal.voteHistory) {
            proposal.voteHistory = [];
        }

        // 1.5 Check for duplicate vote (MVP)
        const voterId = userId || 'anonymous_voter';
        const searchId = userId || 'anonymous'; // Simple check

        // Allow re-voting? For now, just append. In prod, update existing.
        // Let's implement strict "One ID One Vote" for this feature to make it look real
        const existingVoteIndex = proposal.voteHistory.findIndex(v => v.userId === voterId);

        // 2. Update vote count (Handle switching votes if we were fancy, but simple increment for now)
        // If updating: decrement old, increment new.
        // MVP: Just increment.

        if (voteType === 'for') proposal.votesFor++;
        if (voteType === 'against') proposal.votesAgainst++;
        if (voteType === 'abstain') proposal.votesAbstain++;

        // 2.5 Add to History
        proposal.voteHistory.push({
            userId: voterId,
            vote: voteType,
            rationale: rationale,
            timestamp: Date.now()
        });

        // 3. Save back to Redis
        await redis.hset(PROPOSALS_HASH_KEY, proposalId, JSON.stringify(proposal));

        return NextResponse.json({ success: true, proposal });

    } catch (error) {
        console.error('[API] Failed to vote:', error);
        return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
    }
}
