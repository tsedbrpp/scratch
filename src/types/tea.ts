export interface TEAVocabulary {
    id: string;
    term: string;
    description: string;
}

export interface TEATranslation {
    id: string;
    jurisdiction: string;
    referential_drift: string[];
    description: string;
}

export interface TEAInfrastructure {
    id: string;
    name: string;
    description: string;
}

export interface TEAApexNode {
    id: string;
    name: string;
    function: string[];
}

export interface TEAContestation {
    id: string;
    type: "counter_translation" | "sedimentation";
    description: string;
    examples: string[];
}

export interface TEAProposition {
    id: string; // e.g., "prop_1", "prop_2"
    proposition: string;
    evidence: string;
    support_level: "strong" | "moderate" | "weak" | "insufficient";
}

export interface TEAAnalysis {
    propositions?: TEAProposition[];
    vocabularies: TEAVocabulary[];
    translations: TEATranslation[];
    embedding_infrastructures: TEAInfrastructure[];
    apex_nodes: TEAApexNode[];
    contestations: TEAContestation[];
    stratified_legibility: {
        highly_legible: string[];
        weakly_legible: string[];
        description: string;
    };
    short_summary?: string;
    raw_synthesis_text?: string;
}
