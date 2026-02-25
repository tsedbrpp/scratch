// ===================================================================
// GNDP v1.0 — Ghost Node Detection Protocol Types
// ===================================================================

// --- Pass 1A: Extraction-Only Types ---

/** An explicitly named actor, role, body, or class extracted from the text. */
export interface FormalActor {
    name: string;
    role: string;
    hierarchyLevel?: 'Individual' | 'Organizational' | 'Institutional';
    sourceRef?: string;
}

/** A textually grounded claim about an affected population. */
export interface AffectedClaim {
    claim: string;
    supportQuote: string;
    impliedActors: string[]; // max 5 per claim
}

/** A governance decision gate explicitly described in the text. */
export interface ObligatoryPassagePoint {
    name: string;
    type: 'risk_classification' | 'conformity_assessment' | 'deployment_approval' | 'procurement' | 'enforcement' | 'audit' | 'other';
    controllingActor?: string;
}

// --- GNDP Enums ---

export type GhostTypology = 'Structural' | 'Data' | 'Representational' | 'Scale' | 'Temporal' | 'SupplyChain';

/** Evidence grade ladder. E1/E2 = insufficient, E3/E4 = scoring allowed. */
export type EvidenceGrade = 'E1' | 'E2' | 'E3' | 'E4';

export type MaterialImpact = 'Low' | 'Medium' | 'High';
export type OppAccess = 'None' | 'Advisory' | 'Partial' | 'Binding';
export type SanctionPower = 'None' | 'Indirect' | 'Direct';
export type DataVisibility = 'Invisible' | 'Partial' | 'Audited';
export type RepresentationType = 'None' | 'Proxy' | 'Collective' | 'Direct';
export type CounterfactualImpact = 'None' | 'Moderate' | 'Transformative';

// --- GNDP Scoring ---

export interface ScoreBreakdown {
    materialImpact: number;      // 0–30
    oppExclusion: number;        // 0–25
    sanctionAbsence: number;     // 0–20
    dataInvisibility: number;    // 0–15
    representationGap: number;   // 0–10
}

// --- Pass 3: Counterfactual Types ---

export interface TerritorizationResult {
    destabilizesPower: boolean;
    introducesAccountability: boolean;
    reconfiguresData: boolean;
    altersEnforcement: boolean;
}

export interface RiskRedistributionResult {
    beneficiariesOfAbsence: string[];
    shieldedActors: string[];
    reducesCoalitionFriction: boolean;
}

export interface CounterfactualResult {
    actorId: string;
    counterfactualImpact: CounterfactualImpact;
    territorialization: TerritorizationResult;
    riskRedistribution: RiskRedistributionResult;
    reasoning: string; // max 160 chars, tagged speculative
}

// ===================================================================
// Existing Types (extended with GNDP fields)
// ===================================================================

export interface DetectedGhostNode {
    id: string;
    label: string;
    category: string;
    description: string;
    ghostReason: string;
    whyAbsent: string;
    isGhost: true;
    strength?: number;
    color?: string;
    evidence?: Array<{
        rationale: string;
        quote: string;
        sourceRef?: string;
    }>;
    potentialConnections?: Array<{
        targetActor: string;
        relationshipType: string;
        evidence: string;
    }>;
    absenceStrength?: number;
    exclusionType?: 'Active' | 'Passive' | 'Structural' | 'silenced' | 'marginalized' | 'structurally-excluded' | 'displaced' | string;
    absenceType?: string;
    evidenceQuotes?: Array<{
        quote: string;
        actors?: string[];
        sourceRef?: string;
        context?: string;
    }>;
    claim?: {
        summaryBullets?: string[];
        disambiguations?: string[];
        fullReasoning?: string;
    };
    roster?: {
        actors: string[];
        mechanisms: string[];
    };
    missingSignals?: Array<{
        signal: string;
        searchTerms: string[];
    }>;
    structuralAnalysis?: any;
    // GNDP v1.0 extensions
    ghostType?: GhostTypology | null;
    evidenceGrade?: EvidenceGrade;
    absenceScore?: number | null;
    scoreBreakdown?: ScoreBreakdown;
    counterfactual?: CounterfactualResult;
    // GNDP Phase 1 fields (carried through)
    materialImpact?: MaterialImpact;
    oppAccess?: OppAccess;
    sanctionPower?: SanctionPower;
    dataVisibility?: DataVisibility;
    representationType?: RepresentationType;
}

export interface InstitutionalLogics {
    market: {
        strength: number;
        champions: string[];
        material: string;
        discursive: string;
    };
    state: {
        strength: number;
        champions: string[];
        material: string;
        discursive: string;
    };
    professional: {
        strength: number;
        champions: string[];
        material: string;
        discursive: string;
    };
    community: {
        strength: number;
        champions: string[];
        material: string;
        discursive: string;
    };
}

export interface ExclusionMatch {
    trigger: string;
    matchedText: string;
    confidence: 'strong' | 'weak';
}

export interface DocumentSection {
    tag: string;
    heading?: string;
    content: string;
    charOffset: number;
    charLength: number;
}

export interface ParsedDocument {
    sections: DocumentSection[];
    parsingConfidence: number;
}

export interface CandidateActor {
    name: string;
    reason: string;
    absenceStrengthPrelim: "High" | "Medium" | "Low";
    evidencePackets?: Array<{ quote: string; locationMarker: string }>;
    keywords: string[];
    absenceStrength?: number;
    explicitExclusions?: ExclusionMatch[];
    // GNDP v1.0 Phase 1 fields (from Pass 1B)
    materialImpact?: MaterialImpact;
    oppAccess?: OppAccess;
    sanctionPower?: SanctionPower;
    dataVisibility?: DataVisibility;
    representationType?: RepresentationType;
}

export interface AbsentActorResponse {
    name?: string;
    label?: string;
    category?: string;
    id?: string;
    isValid?: boolean;
    tier?: "Tier1" | "Tier2" | "Tier3";
    absenceType?: string;
    reason?: string;
    ghostReason?: string;
    absenceStrength?: number;
    exclusionType?: string;
    institutionalLogics?: {
        market: number;
        state: number;
        professional: number;
        community: number;
    };
    potentialConnections?: Array<{
        targetActor: string;
        relationshipType: string;
        evidence: string;
    }>;
    evidenceQuotes?: Array<{
        quote: string;
        actors?: string[];
        sourceRef?: string;
        context?: string;
    }>;
    claim?: {
        summaryBullets?: string[];
        disambiguations?: string[];
        fullReasoning?: string;
    } | string;
    roster?: {
        actors: string[];
        mechanisms: string[];
    };
    missingSignals?: Array<{
        signal: string;
        searchTerms: string[];
    }>;
    discourseThreats?: string[];
    // GNDP v1.0 extensions
    ghostType?: GhostTypology | null;
    evidenceGrade?: EvidenceGrade;
    absenceScore?: number | null;
    scoreBreakdown?: ScoreBreakdown;
    materialImpact?: MaterialImpact;
    oppAccess?: OppAccess;
    sanctionPower?: SanctionPower;
    dataVisibility?: DataVisibility;
    representationType?: RepresentationType;
}

export interface ValidationIssue {
    actor: string;
    field: string;
    message: string;
}
