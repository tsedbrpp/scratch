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
        risk?: { title: string; description: string; badge: string; quote?: string };
        enforcement?: { title: string; description: string; badge: string; quote?: string };
        rights?: { title: string; description: string; badge: string; quote?: string };
        scope?: { title: string; description: string; badge: string; quote?: string };
    };
    governance_score_explanations?: {
        centralization?: string;
        rights_focus?: string;
        flexibility?: string;
        market_power?: string;
        procedurality?: string;
    };
    // Assemblage Dynamics
    assemblage_dynamics?: {
        territorialization: string;
        deterritorialization: string;
        coding: string;
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
    verification_gap?: {
        high_rhetoric_low_verification: boolean;
        gap_explanation: string;
    };
    user_impression?: string;
    anchor_bias_choice?: "extractive_asymmetrical" | "regenerative_participatory";
    validation_status?: {
        agreement: "yes" | "no";
        justification?: string;
        timestamp: string;
    };
    verified_quotes?: {
        text: string;
        verified: boolean;
        confidence: number; // 0-1
        context: string;
    }[];
    system_critique?: {
        blind_spots: string[];
        over_interpretation: string;
        legitimacy_correction: string;
    };
    stress_test_report?: {
        original_score: number;
        perturbed_score: number;
        framing_sensitivity: "High" | "Medium" | "Low";
        shift_explanation?: string;
        inverted_text_excerpt: string;
        rhetorical_shifts?: { original: string; new: string; explanation: string }[];
    };
    holes?: {
        between: string[];
        concept: string;
        description: string;
        significance: string;
        scores: Record<string, number>;
        prediction_scenarios?: { scenario: string; likelihood: number; indicator: string }[];
    }[];
}

export interface PositionalityData {
    locus: string;
    discipline: string;
    reflexiveGap: string;
    enableCounterNarrative: boolean;
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
    url?: string;
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
    legitimacy_analysis?: LegitimacyAnalysis;
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
export interface EcosystemImpact {
    actor: string;
    mechanism: string;
    impact: string;
    type: "Constraint" | "Affordance";
    interconnection_type?: "Material" | "Discursive" | "Hybrid";
}

export interface LegitimacyAnalysis {
    orders: {
        market: number; // 0-10
        industrial: number;
        civic: number;
        domestic: number;
        inspired: number;
        fame: number;
    };
    dominant_order: string;
    justification_logic: string;
    moral_vocabulary: string[];
    conflict_spot: string;
}

export interface ComparativeSynthesis {
    executive_summary: string;
    cultural_divergence: string;
    institutional_conflict: string;
    legitimacy_tensions: string;
    synthesis_matrix: {
        dimension: string;
        comparison: string;
    }[];
}
