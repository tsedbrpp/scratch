import { z } from 'zod';

export interface Pane1Data {
    evidencePoints: string[];
}

export interface Pane2Data {
    hypothesis: string;
    reasoning: string;
}

export interface StudyCaseConfig {
    requireReflexivity: boolean;
    highlightLogics?: ('market' | 'state' | 'professional' | 'community')[];
}

export interface EvidenceQuote {
    id: string;
    heading?: string;
    text: string;
    context?: string;
    sourceRef: { docId: string; section?: string; paragraph?: string; };
    actorTags: string[];
    mechanismTags: string[];
}

export interface GhostNodeClaim {
    summaryBullets: string[];
    disambiguationPrompts?: { id: string; question: string; options: string[] }[];
    fullReasoning?: string;
    discourseThreats?: Array<{
        dominantDiscourse: string;
        conflictType: string;
        explanation: string;
    }>;
}

export interface EvaluationConfig {
    presenceGateQuestion?: string;
    presenceGateOptions?: string[];
    disambiguationPrompts?: { id: string; question: string; options: string[] }[];
    strengthAbsence?: { min: number; max: number; anchors: { value: number; label: string }[] };
    confidenceOptions?: string[];
    feasibility?: {
        min: number; max: number; anchors: { value: number; label: string }[];
        mechanismGateThreshold: number; mechanismOptions: string[]
    };
}

export interface StudyCase {
    id: string; // Internal ID (e.g., "case_01_workers")
    sourceId?: string; // The ID of the policy source this case belongs to
    nodeId: string; // The ID of the node in the ontology graph
    title: string;
    isCalibration?: boolean;
    // Legacy V1 fields - kept for compatibility
    pane1?: Pane1Data;
    pane2?: Pane2Data;
    config?: StudyCaseConfig;

    // V2 Ghost Node Fields
    documentLabel?: string;
    expectedActor?: string;
    scope?: { evidenceScopeLabel: string; scopeTooltip: string; };
    disambiguationBanner?: { title: string; text: string; };
    evidenceQuotes?: EvidenceQuote[];
    roster?: { actorsInSection: string[]; mechanismsInSection: string[]; };
    missingSignals?: { id: string; label: string }[];
    searchChips?: string[];
    claim?: GhostNodeClaim;
    evaluationConfig?: EvaluationConfig;
    structuralAnalysis?: any; // Reusing node-level any structure for port
    counterfactual?: any;
}

export type InstitutionalLogicStrength = 'weak' | 'moderate' | 'dominant' | null;

export interface InstitutionalLogicsMap {
    market: InstitutionalLogicStrength;
    state: InstitutionalLogicStrength;
    professional: InstitutionalLogicStrength;
    community: InstitutionalLogicStrength;
}

export interface GhostNodeSurveyResponseBase {
    // Provenance
    evaluatorId: string; // Hashed/Pseudonymous
    studyId: string;
    caseId: string;
    caseIndex: number; // Order in the shuffled playlist
    startedAt: number; // Timestamp
    submittedAt: number; // Timestamp
    timeOnCaseMs: number;

    // Assessment
    strength: number | null; // 0-100, null if not evaluated yet
    confidence: 'low' | 'medium' | 'high' | null;
    missingRoles: string[]; // 'representation', 'standard_setting', etc.
    missingRolesOther?: string;
    isUncertain?: boolean;
    institutionalLogics: InstitutionalLogicsMap;
    reflexivity: string; // Required if config.requireReflexivity is true

    // V2 Assessment Fields
    absenceGate?: 'yes' | 'no' | 'unsure';
    selectedQuoteId?: string;
    disambiguationAnswers?: Record<string, string>;
    feasibility?: number; // 0-100
    feasibleMechanisms?: string[];
    feasibilityNotes?: string;
}

// ============================================================================
// SURVEY V3 - ENUMS & STRUCTURED TYPES
// ============================================================================

export const LikertScale5Schema = z.enum(['1', '2', '3', '4', '5']).nullable();

export const PerceivedGapSchema = z.enum([
    'integration_sustainability_risk',
    'ngo_roles_oversight',
    'resource_impact_assessments',
    'eu_framework_links',
    'enforcement_mechanisms',
    'global_harmonization'
]);

export const EnforcementEscalationSchema = z.enum([
    'disclosure_orders',
    'audits',
    'fines',
    'suspensions_withdrawals'
]);

export const AnalyticalChallengeSchema = z.enum([
    'capacity_backlog',
    'strategic_gaming',
    'capture_risk',
    'indirect_impact_measurement'
]);

export const MechanismStepSchema = z.enum([
    'evidence_collection',
    'aggregation',
    'admissibility',
    'review_initiation',
    'response_due_process',
    'remedy_enforcement',
    'deterrence'
]);

export const ImpactCategorySchema = z.enum([
    'environmental',
    'economic',
    'social',
    'legal_regulatory'
]);

export const TableRowStatusSchema = z.enum(['answered', 'cannot_tell', 'not_applicable']).default('answered');

export const MechanismRowSchema = z.object({
    status: TableRowStatusSchema,
    effectiveness: LikertScale5Schema.optional(),
    improvements: z.string().optional(),
    risks: z.string().optional(),
});

export const ImpactRowSchema = z.object({
    status: TableRowStatusSchema,
    direction: z.enum(['Positive', 'Negative', 'Neutral']).nullable().optional(),
    severity: LikertScale5Schema.optional(),
    examples: z.string().optional(),
});

export type MechanismRow = z.infer<typeof MechanismRowSchema>;
export type ImpactRow = z.infer<typeof ImpactRowSchema>;

export const GhostNodeSurveyV3DataSchema = z.object({
    surveyVersion: z.literal('v3'),

    // Grounding Gate
    groundingGate: z.enum(['yes', 'partially', 'no']).nullable().optional(),
    evidenceAnchor: z.string().optional(), // quote ID or reference

    // Section 3: EU AI Act
    euAiActOmissionAgreement: LikertScale5Schema.optional(),
    euAiActOmissionEvidence: z.string().optional(),
    perceivedGaps: z.array(PerceivedGapSchema).optional(),
    perceivedGapsOtherText: z.string().optional(),
    perceivedGapsNuance: z.string().optional(), // kept for general thoughts, though not primary
    broaderImplications: z.string().optional(),

    // Section 4: Counterfactuals
    counterfactualFeasibility: LikertScale5Schema.optional(),
    counterfactualFactorsTechnical: z.string().optional(),
    counterfactualFactorsLegal: z.string().optional(),
    counterfactualFactorsSocial: z.string().optional(),
    counterfactualFactorsEconomic: z.string().optional(),

    // Flattened Mechanism Table (Stable Keys)
    mechanismEval_evidence_collection: MechanismRowSchema.default({ status: 'answered' }).optional(),
    mechanismEval_aggregation: MechanismRowSchema.default({ status: 'answered' }).optional(),
    mechanismEval_admissibility: MechanismRowSchema.default({ status: 'answered' }).optional(),
    mechanismEval_review_initiation: MechanismRowSchema.default({ status: 'answered' }).optional(),
    mechanismEval_response_due_process: MechanismRowSchema.default({ status: 'answered' }).optional(),
    mechanismEval_remedy_enforcement: MechanismRowSchema.default({ status: 'answered' }).optional(),
    mechanismEval_deterrence: MechanismRowSchema.default({ status: 'answered' }).optional(),

    enforcementEscalation: z.array(EnforcementEscalationSchema).optional(),
    enforcementEscalationOtherText: z.string().optional(),
    enforcementNuance: z.string().optional(),

    // Section 5: Impacts and Challenges
    beneficiariesExclusion: LikertScale5Schema.optional(),
    beneficiariesNuance: z.string().optional(),

    // Flattened Impacts Table (Stable Keys)
    impact_environmental: ImpactRowSchema.default({ status: 'answered' }).optional(),
    impact_economic: ImpactRowSchema.default({ status: 'answered' }).optional(),
    impact_social: ImpactRowSchema.default({ status: 'answered' }).optional(),
    impact_legal_regulatory: ImpactRowSchema.default({ status: 'answered' }).optional(),

    analyticalChallenges: z.array(AnalyticalChallengeSchema).optional(),
    analyticalChallengesOtherText: z.string().optional(),
    analyticalChallengesMitigations: z.string().optional(),

    scenarioConfidence: LikertScale5Schema.optional(),
    scenarioConfidenceNuance: z.string().optional(),

    // Section 6: Open-Ended Suggestions
    innovativeIdeas: z.string().optional(),
    crossDisciplinaryInsights: z.string().optional(),
    finalComments: z.string().optional(),
});


export type GhostNodeSurveyResponseV2 = GhostNodeSurveyResponseBase & { surveyVersion?: 'v2' };
export type GhostNodeSurveyResponseV3 = GhostNodeSurveyResponseBase & z.infer<typeof GhostNodeSurveyV3DataSchema>;
export type GhostNodeSurveyResponse = GhostNodeSurveyResponseV2 | GhostNodeSurveyResponseV3;


export const GhostNodeSurveyResponseBaseSchema = z.object({
    evaluatorId: z.string(),
    studyId: z.string(),
    caseId: z.string(),
    caseIndex: z.number(),
    startedAt: z.number(),
    submittedAt: z.number(),
    timeOnCaseMs: z.number(),

    // Assessment
    strength: z.number().nullable(),
    confidence: z.enum(['low', 'medium', 'high']).nullable(),
    missingRoles: z.array(z.string()),
    missingRolesOther: z.string().optional(),
    isUncertain: z.boolean().optional(),
    institutionalLogics: z.object({
        market: z.enum(['weak', 'moderate', 'dominant']).nullable(),
        state: z.enum(['weak', 'moderate', 'dominant']).nullable(),
        professional: z.enum(['weak', 'moderate', 'dominant']).nullable(),
        community: z.enum(['weak', 'moderate', 'dominant']).nullable(),
    }),
    reflexivity: z.string(),

    // V2 Assessment Fields
    absenceGate: z.enum(['yes', 'no', 'unsure']).optional(),
    selectedQuoteId: z.string().optional(),
    disambiguationAnswers: z.record(z.string(), z.string()).optional(),
    feasibility: z.number().min(0).max(100).optional(),
    feasibleMechanisms: z.array(z.string()).optional(),
    feasibilityNotes: z.string().optional(),
});

export const GhostNodeSurveyResponseSchema = z.union([
    GhostNodeSurveyResponseBaseSchema.extend({ surveyVersion: z.literal('v2').optional() }),
    GhostNodeSurveyResponseBaseSchema.merge(GhostNodeSurveyV3DataSchema)
]);

export type SurveyResponseData = Omit<GhostNodeSurveyResponse, 'studyId' | 'evaluatorId' | 'caseId' | 'caseIndex' | 'submittedAt'>;

export interface ParticipantProfile {
    expertiseAreas: string[];
    jurisdictionalFamiliarity: Record<string, number>; // "eu": 4, "us": 2, etc.
}

export interface StudyState {
    evaluatorCode: string | null;
    consentGiven: boolean;
    consentTimestamp: number | null;
    profile: ParticipantProfile | null;
    playlist: string[]; // Array of StudyCase.id, shuffled
    currentCaseIndex: number;
    responses: Record<string, GhostNodeSurveyResponse>; // Keyed by caseId
    isComplete: boolean;
    customCases?: StudyCase[];
}

// --- CONFIGURATION ---

export const STUDY_CASES: StudyCase[] = [];
