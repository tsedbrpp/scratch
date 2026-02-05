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
}
