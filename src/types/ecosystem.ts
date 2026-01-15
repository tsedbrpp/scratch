export type QualitativeMetric = "Strong" | "Moderate" | "Weak" | "Latent";

export interface ReflexiveLogEntry {
    id: string;
    timestamp: number;
    action_type: "Trace_Rejection" | "Actor_Merge" | "Strategic_Subtraction" | "Manual_Inscription" | "Other";
    rationale: string;
    affected_actors?: string[];
    user_id?: string;
}

export interface EcosystemActor {
    id: string;
    name: string;
    type: "Startup" | "Policymaker" | "Civil Society" | "Academic" | "Infrastructure" | "Algorithm" | "Dataset" | "AlgorithmicAgent" | "LegalObject";
    description: string;
    influence: "High" | "Medium" | "Low"; // Legacy field, use metrics.territorialization instead
    url?: string;
    metrics?: {
        // Assemblage Theory Metrics (DeLanda)
        territorialization: QualitativeMetric | number;  // Coding intensity, stability, power to enforce boundaries
        deterritorialization: QualitativeMetric | number; // Lines of flight, mutation potential, resistance to capture
        coding: QualitativeMetric | number;              // How tightly defined/categorized, rigidity of identity
        rationale?: string;
        dynamic_power?: number; // Calculated via centrality/pagerank (internal only)

        // Dimensional Breakdown (V3) - De-quantified for interpretive rigor
        territoriality?: QualitativeMetric | number; // Power to enforce (legacy, maps to territorialization)
        centrality?: QualitativeMetric | number;    // Network reach
        counter_conduct?: QualitativeMetric | number;    // Active subversion (maps to deterritorialization)
        discursive_opposition?: QualitativeMetric | number; // Critical speech (maps to deterritorialization)
    };
    source?: "default" | "absence_fill";
    quotes?: string[];
    region?: "Global North" | "Global South" | "International" | "Unknown";
    role_type?: "Material" | "Expressive" | "Mixed";
    materialized_from?: {
        source_id: string;
        context_type: "accountability" | "legitimacy" | "cultural_absence" | "trace";
        context_detail: string;
    };

    // NEW: ANT trace metadata (optional for backward compatibility)
    trace_metadata?: {
        source: "document_extraction" | "ai_inference" | "user_input";
        evidence: string;
        provisional: boolean;
        confidence: number;
    };
}

export interface EcosystemConfiguration {
    id: string;
    name: string;
    description: string;
    memberIds: string[];
    properties: {
        stability: "High" | "Medium" | "Low";
        generativity: "High" | "Medium" | "Low";
        calculated_stability?: number; // 0-1 (Internal density)
        porosity_index?: number; // 0-1 (External connections / Total connections)
        [key: string]: string | number | undefined;
    };
    color: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analysisData?: any; // To store full AssemblageExtractionResult
    reflexive_log?: ReflexiveLogEntry[];
}



export interface AssemblageAnalysis {
    narrative: string;
    missing_voices: { name: string; reason: string; category: string }[];
    structural_voids: string[];
    blindspot_intensity: "Low" | "Medium" | "High";
    socio_technical_components: {
        infra: string[];
        discourse: string[];
    };
    policy_mobilities: {
        origin_concepts: string[];
        local_mutations: string[];
    };
    stabilization_mechanisms: string[];
    relations_of_exteriority?: {
        detachable: string[];
        embedded: string[];
        mobility_score: "High" | "Medium" | "Low";
    };
    provisional_status?: import('./provisional').ProvisionalInscription;
    computed_metrics?: {
        territorialization_audit?: string[];
        coding_audit?: string[];
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assemblage?: any; // Full assemblage object from API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    impacts?: any[]; // Impact analysis from API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    traces?: any[]; // To store ANT trace objects if included
}

export interface AiAbsenceAnalysis {
    narrative: string;
    missing_voices: { name: string; reason: string; category: string }[];
    structural_voids: string[];
    blindspot_intensity: "Low" | "Medium" | "High";
    recommendations?: string[];
    blindspots?: string[]; // Legacy field support
}

export interface TranslationStage {
    id: string;
    label: string;
    description: string;
    actors: string[];
    ontology: "social" | "regulatory" | "technical" | "market";
    required_actor_types?: string[]; // Types of actors expected in this stage (e.g. ['Policy', 'NGO'])
    fidelity_score?: number; // 0-1, calculated dynamically
    betrayal_type?: "Simplification" | "Displacement" | "None";
    active_actor_count?: number; // The logic-based count of actors present in this stage
}

export interface AssemblageExplanationHull {
    id: string;
    classification: "Fortress" | "Sieve" | "Meshwork" | string;
    interpretation: string;
}

export interface AssemblageExplanation {
    narrative: string;
    hulls: AssemblageExplanationHull[];
}

export interface EcosystemEdge {
    source: string;
    target: string;
    type: string;
    label?: string; // Optional label for visualization
    weight?: number; // Strength of connection
    description?: string; // Helper text
}
