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

export interface GhostNodeSurveyResponse {
    // Provenance
    evaluatorId: string; // Hashed/Pseudonymous
    studyId: string;
    caseId: string;
    caseIndex: number; // Order in the shuffled playlist
    startedAt: number; // Timestamp
    submittedAt: number; // Timestamp
    timeOnCaseMs: number;

    // Assessment
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

export const GhostNodeSurveyResponseSchema = z.object({
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
