import { GENESIS_TIMESTAMP, PHASE_DURATIONS, VETO_CONFIG } from '@/config/governance-config';
import { GovernanceProfile, GenesisPhase, VerificationMethod, VerificationStatus } from '@/types/governance';
import { TenureMath } from '@/lib/governance/tenure-math';
import { logger } from '@/lib/logger';

/**
 * Sybil Resistance Adapter Interface
 * Allows swapping verification providers (Platform vs Decentralized)
 */
export interface IVerificationAdapter {
    verifyUser(userId: string): Promise<{ status: VerificationStatus, method: VerificationMethod, hash?: string }>;
}

/**
 * Default Platform Verifier (Email/Internal)
 */
class PlatformVerifier implements IVerificationAdapter {
    async verifyUser(userId: string) {
        // Mock implementation - in prod this checks DB or Auth Provider
        return {
            status: 'VERIFIED' as VerificationStatus,
            method: 'PLATFORM' as VerificationMethod,
            hash: `platform_hash_${userId}` // Placeholder hash
        };
    }
}

export class GovernanceService {
    private verifier: IVerificationAdapter;
    private developerVetoesUsed: number = 0;
    private readonly MAX_TRANSITION_VETOES = 3;

    constructor(verifier?: IVerificationAdapter) {
        this.verifier = verifier || new PlatformVerifier();
    }

    /**
     * Determines the current Constitutional Phase based on time elapsed since Genesis.
     */
    public getCurrentPhase(): GenesisPhase {
        const now = Date.now();
        const elapsed = now - GENESIS_TIMESTAMP;

        if (elapsed < PHASE_DURATIONS.FOUNDING) {
            return GenesisPhase.FOUNDING;
        } else if (elapsed < PHASE_DURATIONS.TRANSITION) {
            return GenesisPhase.TRANSITION;
        } else {
            return GenesisPhase.SOVEREIGNTY;
        }
    }

    /**
     * Checks if a user is eligible to vote based on Phase and Profile.
     */
    public async canVote(profile: GovernanceProfile): Promise<{ allowed: boolean; reason?: string }> {
        const phase = this.getCurrentPhase();

        // 1. Sybil Check: Must be Verified
        if (profile.verificationStatus !== 'VERIFIED') {
            return { allowed: false, reason: "User identification not verified (Sybil protection)." };
        }

        // 2. Phase-Specific Rules
        switch (phase) {
            case GenesisPhase.FOUNDING:
                // Only Core Team or Whitelisted users
                // Simplification for MVP: Founding phase allows voting but Dev Veto is absolute
                return { allowed: true };

            case GenesisPhase.TRANSITION:
                return { allowed: true };

            case GenesisPhase.SOVEREIGNTY:
                return { allowed: true };

            default:
                return { allowed: false, reason: "System Error: Unknown Phase" };
        }
    }

    /**
     * Calculates the effective voting power for a user.
     */
    public calculateVotingPower(profile: GovernanceProfile): number {
        return TenureMath.calculateWeight(profile.tenureDays);
    }

    /**
     * Applies a Developer Veto (Only valid in Transition Phase)
     */
    public applyDeveloperVeto(proposalId: string, rationale: string): boolean {
        const phase = this.getCurrentPhase();

        if (phase === GenesisPhase.FOUNDING) {
            logger.governance(`[VETO] Founding Phase Veto applied to ${proposalId}. Rationale: ${rationale}`);
            return true; // Absolute power
        }

        if (phase === GenesisPhase.TRANSITION) {
            if (this.developerVetoesUsed >= this.MAX_TRANSITION_VETOES) {
                logger.warn(`[VETO REJECTED] Max vetoes (${this.MAX_TRANSITION_VETOES}) exceeded.`);
                return false;
            }
            this.developerVetoesUsed++;
            logger.governance(`[VETO] Transition Veto used (${this.developerVetoesUsed}/${this.MAX_TRANSITION_VETOES}). Rationale: ${rationale}`);
            return true; // Limited power
        }

        if (phase === GenesisPhase.SOVEREIGNTY) {
            logger.error("[VETO ILLEGAL] Developer has no veto power in Sovereignty Phase.");
            return false; // No power
        }

        return false;
    }

    /**
     * Registration / Profile Creation Helper
     */
    public async registerUser(userId: string): Promise<GovernanceProfile> {
        const verification = await this.verifier.verifyUser(userId);

        return {
            userId,
            verificationStatus: verification.status,
            verificationMethod: verification.method,
            verificationDate: Date.now(),
            identityHash: verification.hash,
            firstActiveDate: Date.now(),
            tenureDays: 0,
            votingWeight: 1.0,
            proposalsCreated: 0,
            votesCast: 0,
            deliberationsJoined: 0
        };
    }

    /**
     * Governance Proposal Creation
     */
    public async createEpistemicNegationProposal(userId: string, analysisId: string, promptId: string, reason: string, sourceId?: string, sourceTitle?: string): Promise<import('@/types/governance').GovernanceProposal> {
        return this.createProposal(userId, {
            type: 'epistemic_negation',
            title: sourceTitle ? `Veto Analysis: ${sourceTitle}` : `Veto Analysis ${analysisId.substring(0, 8)}`,
            description: reason,
            targetAnalysisId: analysisId,
            targetPromptId: promptId,
            targetSourceId: sourceId,
            targetSourceTitle: sourceTitle,
            negationReason: reason
        });
    }

    /**
     * Governance Proposal Retrieval
     */
    public async getProposals(): Promise<import('@/types/governance').GovernanceProposal[]> {
        try {
            const response = await fetch('/api/governance/proposals');
            if (!response.ok) throw new Error('Failed to fetch proposals');
            return await response.json();
        } catch (error) {
            console.error('Failed to get proposals', error);
            return [];
        }
    }

    /**
     * Cast a vote on a proposal
     */
    public async castVote(proposalId: string, voteType: 'for' | 'against' | 'abstain', rationale?: string): Promise<import('@/types/governance').GovernanceProposal | null> {
        try {
            const response = await fetch('/api/governance/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId,
                    voteType,
                    rationale,
                    userId: 'current_user' // In a real app this comes from session
                })
            });

            if (!response.ok) throw new Error('Failed to vote');
            const data = await response.json();
            return data.proposal;
        } catch (error) {
            console.error('Failed to cast vote', error);
            return null;
        }
    }

    /**
     * Delete a proposal (Owner Only)
     */
    public async deleteProposal(proposalId: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/governance/proposals?id=${proposalId}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Failed to delete proposal', error);
            return false;
        }
    }

    private async createProposal(userId: string, data: Partial<import('@/types/governance').GovernanceProposal>): Promise<import('@/types/governance').GovernanceProposal> {
        // Mock ID generation
        const id = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        const proposal: import('@/types/governance').GovernanceProposal = {
            id,
            type: data.type || 'feature_request',
            title: data.title || 'Untitled Proposal',
            description: data.description || '',
            proposerId: userId,
            createdAt: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 Days
            status: 'active',
            votesFor: 0,
            votesAgainst: 0,
            votesAbstain: 0,
            ...data
        };

        try {
            await fetch('/api/governance/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(proposal)
            });
            logger.governance(`[PROPOSAL CREATED] ${proposal.type} by ${userId}: ${proposal.title}`);
        } catch (error) {
            console.error('Failed to persist proposal', error);
        }

        return proposal;
    }
}
