export type EscalationLevel = 'NONE' | 'SOFT' | 'MEDIUM' | 'HARD';

export type EscalationReasonCode =
    | 'HIGH_ABSENCE'
    | 'HIGH_COLONIALITY'
    | 'RECURRENT_PATTERN'
    | 'DOMAIN_SEVERITY'
    | 'MANUAL_TRIGGER';

export type MitigationStrategyId =
    | 'MITIGATION_ADD_CONTEXT'      // Added Missing Historical Context
    | 'MITIGATION_ADJUST_SCOPE'     // Reduced Claim Universality
    | 'MITIGATION_TAG_ACTOR'        // Tagged Marginalized Actor Group
    | 'MITIGATION_DIVERGENCE_NOTE'  // Explicitly Noted Theoretical Divergence
    | 'MITIGATION_CUSTOM';          // User-defined mitigation

export type DeferralReason = 'STRUCTURAL_LIMIT' | 'OUT_OF_SCOPE';

export type ReassemblyAction =
    | {
        type: 'MITIGATION';
        strategyId: MitigationStrategyId | string;
        rationale: string;
        timestamp: number
    }
    | {
        type: 'DEFERRAL';
        reason: DeferralReason;
        rationale: string;
        timestamp: number
    }
    | {
        type: 'RE_EVALUATION';
        previousScore: string;
        newScore: string;
        timestamp: number;
        rationale?: string;
    };

export interface EscalationConfiguration {
    recurrence_count?: number;
    risk_domain_severity?: 'GENERAL' | 'MEDICAL' | 'LEGAL' | 'CRITICAL';
    evaluator_variance?: number; // 0-1
    enforcement_signal_strength?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface EscalationStatus {
    level: EscalationLevel;
    status: 'DETECTED' | 'RESOLVED' | 'OVERRIDDEN' | 'DEFERRED';
    reasons: EscalationReasonCode[];
    rationale?: string; // AI or Rule rationale
    configuration?: EscalationConfiguration;
    actions: ReassemblyAction[]; // Audit trail
    printed_limitations: string[]; // For PDF inscription
}
