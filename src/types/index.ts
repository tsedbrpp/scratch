export interface TemporalAnalysis {
    score: number; // 0 (Apocalyptic/Closed) to 100 (Iterative/Open)
    framing: "Urgency" | "Destiny" | "Hype" | "Maintenance" | "Care";
    evidence: string;
}

export interface EconomicAnalysis {
    burden_bearer: "Individual" | "State" | "Developer" | "Society";
    cost_visibility: "Hidden" | "Explicit";
    market_consolidation_risk: "Low" | "Medium" | "High";
    explanation: string;
}

export interface UserRebuttal {
    text: string;
    timestamp: string;
    user: string;
}

// Blind Spot Type System (Progressive Enhancement: Tier 0-3)

/** Tier 1: Basic structured blind spot with severity and category */
export interface BlindSpotBasic {
    id: string;
    title: string;
    category?: "epistemic" | "power" | "materiality" | "temporality" | "coloniality";
    severity?: "low" | "medium" | "high";
}

/** Tier 2: Enhanced blind spot with evidence and implications */
export interface BlindSpotEnhanced extends BlindSpotBasic {
    description: string;
    severity_rationale?: string;
    evidence?: {
        type: "absence" | "assumption" | "omission";
        quote?: string;
        context: string;
    };
    implications?: string;
    suggested_mitigations?: string[];
}

/** Tier 3: Interactive blind spot with status tracking */
export interface BlindSpotInteractive extends BlindSpotEnhanced {
    status: "detected" | "acknowledged" | "addressed" | "suppressed";
    addressed_in?: string; // Reference to follow-up analysis ID
    suppression_justification?: string;
    user_notes?: string;
    created_at?: string;
    updated_at?: string;
}

/** Union type for backward compatibility (Tier 0 = string) */
export type BlindSpot = string | BlindSpotBasic | BlindSpotEnhanced | BlindSpotInteractive;

export interface AnalysisResult {
    rebuttals?: Record<string, UserRebuttal>; // Keyed by risk dimension ID (e.g. 'normalization_of_violence')
    accountability_map?: {
        signatory?: string;
        liability_holder?: string;
        appeals_mechanism?: string;
        human_in_the_loop?: boolean;
    };
    legitimacy_claims?: {
        source?: string;
        mechanisms?: string;
        tensions?: string;
    };
    silenced_voices?: string[];
    key_insight?: string;
    raw_response?: string;
    // Governance Analysis fields
    governance_power_accountability?: string;
    plurality_inclusion_embodiment?: string;
    agency_codesign_self_determination?: string;
    reflexivity_situated_praxis?: string;
    coloniality_of_power?: string; // New field for center-periphery analysis
    governance_scores?: {
        centralization: number;
        rights_focus: number;
        flexibility: number;
        market_power: number;
        procedurality: number;
        coloniality?: number;
        epistemic_asymmetry?: number;
        power_concentration?: number;
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
        coloniality?: string; // New explanation
    };
    // Assemblage Dynamics
    assemblage_analysis?: import('./ecosystem').AssemblageAnalysis;
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
    enforcement_culture?: string; // Added for Cultural Framing
    concept_map?: {
        nodes: { id: string; label: string; type: "Actor" | "Concept" | "Value" | "Institution" | "Risk" | "Technology"; importance: number }[];
        edges: { source: string; target: string; relation: string; label: string }[];
    };
    plain_language_summary?: {
        one_sentence_overview: string;
        key_points: {
            number: number;
            heading: string;
            paragraphs: string[];
        }[];
        dominant_cultural_logic: {
            label: string;
            explanation: string;
        };
        silenced_voices_detailed: string;
    };
    // Institutional Logics fields
    logics?: {
        market?: LogicAnalysis;
        state?: LogicAnalysis;
        professional?: LogicAnalysis;
        community?: LogicAnalysis;
    };
    coloniality?: string; // Added based on the snippet, assuming it's a top-level field
    dominant_logic?: string;
    logic_conflicts?: LogicConflict[];
    overall_assessment?: string;
    verification_gap?: {
        high_rhetoric_low_verification: boolean;
        gap_explanation: string;
    };
    verification_pathways?: VerificationPathways; // Added new field
    // Micro-Fascism Risk Components
    temporal_orientation?: TemporalAnalysis | string; // Union to support Cultural Framing (string) and Risk (object)
    economic_burden?: EconomicAnalysis;
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
        critique?: string;
        blind_spots: BlindSpot[]; // Now accepts any tier
        over_interpretation?: string;
        legitimacy_correction?: string;
        implications?: string[];
        epistemic_coverage_score?: number; // 0-100, calculated from severity
        detection_tier?: 0 | 1 | 2 | 3; // Tracks what AI produced
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

    }[];
    perspectives?: Record<string, string>;
    provisional_status?: import('./provisional').ProvisionalInscription;

    // Extended Diagnostics (narratives generated on-demand)
    extended_risk_diagnostic?: string;
    extended_liberatory_diagnostic?: string;

    // Transparency & Provenance fields (Phase 1)
    confidence?: import('./provenance').ConfidenceScore;
    metadata?: import('./provenance').PromptMetadata;
    provenance_chain?: import('./provenance').ProvenanceChain;

    // [NEW] Governance Status
    escalation_status?: import('./escalation').EscalationStatus;
}

// Core interfaces for analysis
export interface PositionalityData {
    locus: string;
    discipline: string;
    reflexiveGap: string;
    enableCounterNarrative: boolean;
}

export interface VerificationPathways {
    visibility: string[];
    enforcement: string[];
    publication: string[];
    exemptions: string[];
    score: number;
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
    type: "PDF" | "Web" | "Text" | "Trace" | "Word";
    traceType?: "provenance" | "resistance"; // Distinguish between empirical evidence and resistance reactions
    url?: string;
    sourceUrl?: string; // For Traces
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
    policyId?: string; // Links this source (e.g. specialized trace) to a parent policy document
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
    interconnection_type?: "Material" | "Discursive" | "Hybrid" | "Interpretive / Meaning-Making";
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
    evidence_quotes?: Record<string, string[]>;
    dominant_order: string;
    justification_logic: string;
    moral_vocabulary: string[];
    conflict_spot: string | {
        location: string;
        description: string;
        resolution_strategy?: string;
        course_of_action?: string;
    };
    system_critique?: {
        blind_spots: string[];
        over_interpretation: string;
        legitimacy_correction: string;
    };
}

export interface ComparativeSynthesis {
    // Transparency fields
    metadata?: import('./provenance').PromptMetadata;
    confidence?: import('./provenance').ConfidenceScore;
    synthesis_summary: string;
    key_divergences: {
        theme: string;
        description: string;
        stances: { policy: string; stance: string }[];
    }[];
    concept_mutations: {
        concept: string;
        origin_context: string;
        local_mutations: { policy: string; mutation: string; mechanism: string }[];
    }[];
    assemblage_network: {
        nodes: string[];
        edges: { from: string; to: string; type: string }[];
    };
    stabilization_mechanisms: {
        jurisdiction: string;
        mechanism: string;
        type: "Bureaucratic" | "Market" | "State" | "Legal";
    }[];
    desire_and_friction: {
        topic: string;
        friction_point: string;
        underlying_desire: string;
    }[];
    institutional_conflict: {
        conflict_type: string;
        description: string;
        evidence: { policy: string; text: string }[];
    }[];
    legitimacy_tensions: {
        tension_type: string;
        description: string;
        evidence: { policy: string; text: string }[];
    }[];
    coloniality_assessment: string;
    synthesis_matrix?: never;
}

export interface ResistanceSynthesisResult {
    executive_summary: string;
    dominant_strategies: {
        strategy: string;
        frequency: "High" | "Medium" | "Low";
        description: string;
        minor_actor_verification?: string;
    }[];
    lines_of_flight: {
        narrative_aggregate: string;
        scoring_breakdown: {
            connectivity: string;
            intensity: string;
            decoding_impact: string;
            exteriority: string;
            trajectory: string;
        };
        recapture_pressure: "High" | "Medium" | "Low";
        vectors_of_deterritorialization: {
            name: string;
            intensity: "High" | "Medium" | "Low";
            description: string;
        }[];
    };
    reflexive_audit?: {
        analyst_positionality: string;
        uncertainty_flags: string;
    };
    implications_for_legitimacy: string;
    implications_for_policy?: string; // Legacy optional
    emerging_themes?: string[]; // Legacy optional
}
