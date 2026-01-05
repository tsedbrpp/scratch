export interface EcosystemActor {
    id: string;
    name: string;
    type: "Startup" | "Policymaker" | "Civil Society" | "Academic" | "Infrastructure" | "Algorithm" | "Dataset";
    description: string;
    influence: "High" | "Medium" | "Low";
    url?: string;
    metrics?: {
        influence: number;
        alignment: number;
        resistance: number;
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
        [key: string]: string | number;
    };
    color: string;
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
