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
}

export interface ValidationIssue {
    actor: string;
    field: string;
    message: string;
}
