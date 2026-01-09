/**
 * Provisional Inscription Types
 * Represents AI outputs with acknowledged fragility and contestability
 * 
 * Key Principle: AI outputs are PROVISIONAL, not authoritative
 */

export interface FragilityScore {
    value: number; // 0-1 (1 = highly fragile)
    factors: {
        input_completeness: number;
        model_uncertainty: number;
        theoretical_tension: number;
        empirical_grounding: number;
    };
    interpretation: "stable" | "contested" | "provisional" | "speculative";
}

export interface ProvisionalInscription {
    content: string;
    source: "ai_generated" | "user_validated" | "document_extracted";

    fragility_score: FragilityScore;
    authority_conditions: string[]; // When this gains traction
    contestation_risks: string[]; // How it could be contested

    alternative_interpretations?: {
        interpretation: string;
        theoretical_basis: string;
        plausibility: number;
    }[];

    created_at: string;
    last_contested_at?: string;
}

export interface HybridAnalysisResult {
    mode: "hybrid_reflexive";

    ant_trace: any; // From ANT layer
    assemblage_analysis: any; // From Assemblage layer

    theoretical_tensions: {
        description: string;
        latour_would_reject: string;
        delanda_requires: string;
        our_instrumentalization: string;
    }[];

    provisional_status: ProvisionalInscription;
}
