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

export interface StudyCase {
    id: string; // Internal ID (e.g., "case_01_workers")
    sourceId?: string; // The ID of the policy source this case belongs to
    nodeId: string; // The ID of the node in the ontology graph
    title: string;
    isCalibration?: boolean;
    pane1: Pane1Data;
    pane2: Pane2Data;
    config: StudyCaseConfig;
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
}

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

export const STUDY_CASES: StudyCase[] = [
    {
        id: "calibration_smes",
        nodeId: "2", // Assuming "Global South State" is a proxy/placeholder for calibration for now, or we need a real ID. Using '2' as placeholder.
        title: "Calibration: SMEs in EU AI Act",
        isCalibration: true,
        pane1: {
            evidencePoints: [
                "Recital 4a: 'SMEs shall be supported...'",
                "Article 10: 'Compliance burdens must be proportionate...'"
            ]
        },
        pane2: {
            hypothesis: "Contested Exclusion",
            reasoning: "SMEs are mentioned frequently but lack enforcement trigger power."
        },
        config: {
            requireReflexivity: true
        }
    },
    {
        id: "case_01_workers",
        nodeId: "3", // Placeholder
        title: "Case 1: Workers & Labor Unions",
        pane1: {
            evidencePoints: [
                "Article 4: 'Providers shall ensure...'",
                "No mention of 'collective bargaining' or 'union' in risk assessment obligations."
            ]
        },
        pane2: {
            hypothesis: "Constitutive Ghost Node",
            reasoning: "The document addresses 'business leaders' and 'organizations' but is silent on workers whose labor conditions, surveillance, and job security are likely to be affected by AI deployment and compliance measures. Labor unions and worker representatives, common stakeholders in EU social policy, are not mentioned."
        },
        config: {
            requireReflexivity: true
        }
    },
    {
        id: "case_02_environmental",
        nodeId: "4",
        title: "Case 2: Environmental NGOs",
        pane1: {
            evidencePoints: [
                "Article 29: 'Environmental impact assessments...'",
                "Consultation board includes industry representatives."
            ]
        },
        pane2: {
            hypothesis: "Co-opted Logic",
            reasoning: "Environmental concerns are framed purely as efficiency metrics rather than sustainability constraints. NGOs are given observer status but no voting rights."
        },
        config: {
            requireReflexivity: true
        }
    },
    {
        id: "case_03_future",
        nodeId: "5",
        title: "Case 3: Future Generations",
        pane1: {
            evidencePoints: [
                "Recital 10: 'Long-term risks...'",
                "No mechanism for representing future interests."
            ]
        },
        pane2: {
            hypothesis: "Constitutive Ghost Node",
            reasoning: "Future generations are the bearer of long-term risks but have no representation in current risk assessment frameworks."
        },
        config: {
            requireReflexivity: true
        }
    }
];
