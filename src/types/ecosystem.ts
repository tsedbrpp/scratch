export interface EcosystemActor {
    id: string;
    name: string;
    type: "Startup" | "Policymaker" | "Civil Society" | "Academic" | "Infrastructure" | "Algorithm" | "Dataset" | "AlgorithmicAgent" | "LegalObject";
    description: string;
    influence: "High" | "Medium" | "Low";
    url?: string;
    metrics?: {
        influence: number;
        alignment: number;
        resistance: number;
        rationale?: string;
        dynamic_power?: number; // Calculated via centrality/pagerank
        // Dimensional Breakdown (V3)
        territoriality?: number; // Power to enforce (1-10)
        coding?: number;        // Power to define (1-10)
        centrality?: number;    // Network reach (1-10)
        counter_conduct?: number;    // Active subversion (1-10)
        discursive_opposition?: number; // Critical speech (1-10)
    };
    source?: "default" | "simulation" | "absence_fill";
    quotes?: string[];
    region?: "Global North" | "Global South" | "International" | "Unknown";
    role_type?: "Material" | "Expressive" | "Mixed";
    materialized_from?: {
        source_id: string;
        context_type: "accountability" | "legitimacy" | "cultural_absence" | "trace";
        context_detail: string;
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
}

export interface BridgingConcept {
    concept: string;
    explanation: string;
}

export interface CulturalHole {
    id: string;
    clusterA: string;
    clusterB: string;
    distance: number;
    bridgingConcepts: BridgingConcept[];
    opportunity: string;
    policyImplication: string;
}

export interface CulturalFraming {
    state_market_society: string;
    technology_role: string;
    rights_conception: string;
    historical_context: string;
    epistemic_authority: string;
    temporal_orientation: string;
    enforcement_culture: string;
    cultural_distinctiveness_score: number;
    cultural_distinctiveness_rationale: string;
    dominant_cultural_logic: string;
    silenced_voices: string[];
}

export interface CulturalHolesAnalysisResult {
    summary: string;
    overall_connectivity_score: number;
    holes: CulturalHole[];
    silences?: { id: string; name: string; category: string; keywords: string[] }[];
    recommendations?: { role: string; action: string }[];
    cultural_framing?: CulturalFraming;
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

