export interface AnalysisResult {
    legitimacy_claims?: {
        source?: string;
        mechanisms?: string;
        tensions?: string;
    };
    key_insight?: string;
    raw_response?: string;
    // Governance Analysis fields
    governance_power_accountability?: string;
    plurality_inclusion_embodiment?: string;
    agency_codesign_self_determination?: string;
    reflexivity_situated_praxis?: string;
    governance_scores?: {
        centralization: number;
        rights_focus: number;
        flexibility: number;
        market_power: number;
        procedurality: number;
    };
    structural_pillars?: {
        risk?: { title: string; description: string; badge: string };
        enforcement?: { title: string; description: string; badge: string };
        rights?: { title: string; description: string; badge: string };
        scope?: { title: string; description: string; badge: string };
    };
    // Cultural Framing fields
    state_market_society?: string;
    technology_role?: string;
    rights_conception?: string;
    historical_context?: string;
    epistemic_authority?: string;
    cultural_distinctiveness_score?: number;
    dominant_cultural_logic?: string;
    // Institutional Logics fields
    logics?: {
        market?: LogicAnalysis;
        state?: LogicAnalysis;
        professional?: LogicAnalysis;
        community?: LogicAnalysis;
    };
    dominant_logic?: string;
    logic_conflicts?: LogicConflict[];
    overall_assessment?: string;
}

export interface LogicAnalysis {
    strength: number;
    champions: string[];
    material: string;
    discursive: string;
    key_tensions: string[];
}

export interface LogicConflict {
    between: string;
    site_of_conflict: string;
    resolution_strategy: string;
}

export interface Source {
    id: string;
    title: string;
    description: string;
    type: "PDF" | "Web" | "Text" | "Trace";
    jurisdiction?: "EU" | "Brazil" | "US";
    pageCount?: number;
    addedDate: string;
    publicationDate?: string; // YYYY-MM-DD
    version?: string; // e.g., "1.0", "Draft", "Final"
    timelineEvents?: TimelineEvent[];
    status: "Active Case" | "Archived" | "Pending";
    colorClass: string;
    iconClass: string;
    extractedText?: string;
    analysis?: AnalysisResult;
    cultural_framing?: AnalysisResult;
    institutional_logics?: AnalysisResult;
    resistance_analysis?: ResistanceAnalysis;
}

export interface TimelineEvent {
    date: string; // YYYY-MM-DD
    title: string;
    description: string;
    type: "Milestone" | "Amendment" | "Proposal" | "Enactment";
}

export interface TheoreticalLens {
    id: string;
    name: string;
    description: string;
    prompts: string[];
}

export interface ResistanceAnalysis {
    strategy_detected: string;
    evidence_quote: string;
    interpretation: string;
    confidence: "High" | "Medium" | "Low";
}
