/**
 * ANT (Actor-Network Theory) Types
 * These types represent the methodological layer - empirical tracing of actors and associations
 * 
 * Key Principle: ANT is a METHOD for tracing networks, not an ontology
 */

export type TraceSource = "document_extraction" | "ai_inference" | "user_input";

export interface TracedActor {
    id: string;
    name: string;
    type: string;

    // ANT-specific fields
    trace_source: TraceSource;
    trace_evidence: string; // Quote or reference from source
    provisional: boolean; // True if AI-generated
    confidence: number; // 0-1

    // Backward compatibility - preserve existing metrics
    metrics?: Record<string, any>;
}

export interface Association {
    source: string;
    target: string;
    relation_type: "Regulates" | "Funds" | "Excludes" | "Extracts" | "Supports" | "Contests";
    trace_evidence: string;
    strength: number; // 0-1
    provisional: boolean;
}

export interface TranslationStage {
    id: string;
    label: string;
    description: string;
    actors: string[];
    ontology: "social" | "regulatory" | "technical" | "market";
    fidelity_score?: number;
    betrayal_type?: "Simplification" | "Displacement" | "None";
}

export interface TraceSequence {
    stages: TranslationStage[];
    fidelity_scores: number[];
    betrayal_points: {
        stage_index: number;
        type: "Simplification" | "Displacement";
        description: string;
    }[];
}

export interface ANTTraceResult {
    mode: "ant_trace";
    traced_actors: TracedActor[];
    associations: Association[];
    translation_sequence?: TraceSequence;
    provenance_summary: string;
    metadata: {
        total_actors: number;
        document_extracted: number;
        ai_inferred: number;
        user_provided: number;
    };
}
