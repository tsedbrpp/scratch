/**
 * Meta-Governance Core Types
 * Defines the state shape for the governance layer, including User Profiles,
 * Genesis Phases, and Verification logic.
 */

export enum GenesisPhase {
    FOUNDING = 'FOUNDING',       // Developers hold veto, System is "Benevolent Dictatorship"
    TRANSITION = 'TRANSITION',   // Community voting active, Developer has limited veto (3x)
    SOVEREIGNTY = 'SOVEREIGNTY'  // Full community control, no Developer veto
}

export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED';

export type VerificationMethod =
    | 'PLATFORM'        // Email / Payment / Internal Check
    | 'DECENTRALIZED'   // Gitcoin Passport / WorldID / Eth Address
    | 'VOUCHED';        // Vouched by distinct Verified Users

export interface GovernanceProfile {
    userId: string;

    // Identity & Sybil Resistance
    verificationStatus: VerificationStatus;
    verificationMethod?: VerificationMethod;
    verificationDate?: number; // Timestamp
    identityHash?: string; // Anonymized unique hash for Sybil check

    // Tenure & Weight
    firstActiveDate: number; // Timestamp of first meaningful interaction
    tenureDays: number; // Derived: (Now - FirstActive) in Days
    votingWeight: number; // Calculated via TenureMath

    // Participation History
    proposalsCreated: number;
    votesCast: number;
    deliberationsJoined: number;

    // Reputation / Signals (Future Work)
    reputationScore?: number;
}

export interface GovernanceSystemState {
    phase: GenesisPhase;
    totalVerifiedUsers: number;
    activeProposals: number;
    genesisTimestamp: number; // The start of the governance timeline
    developerVetoCount: number; // Track usage of limited veto power
}
