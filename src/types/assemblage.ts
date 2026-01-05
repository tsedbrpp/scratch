
export type AssemblageStability = "High" | "Medium" | "Low";
export type AssemblageGenerativity = "High" | "Medium" | "Low";
export type ComponentRole = "Material" | "Expressive" | "Mixed";

export interface AssemblageProperties {
    stability: AssemblageStability;
    generativity: AssemblageGenerativity;
    territorialization_score: number; // Computed from Traces
    coding_intensity_score: number;   // Computed from Traces
    [key: string]: string | number | undefined;
}

export interface AssemblageActor {
    name: string;
    type: "Startup" | "Policymaker" | "Civil Society" | "Academic" | "Infrastructure" | "Algorithm" | "Dataset";
    description: string;
    region: "Global North" | "Global South" | "International" | "Unknown";
    role_type: ComponentRole; // New DeLanda metric
    evidence_quotes: string[];
}

export interface AssemblageRelation {
    source: string;
    target: string;
    label: string;
}

export interface AssemblageObject {
    name: string;
    description: string;
    properties: AssemblageProperties;
    // Critique & Analysis Fields
    narrative?: string;
    missing_voices?: { name: string; reason: string; category: string }[];
    structural_voids?: string[];
    socio_technical_components?: {
        infra: string[];
        discourse: string[];
    };
    policy_mobilities?: {
        origin_concepts: string[];
        local_mutations: string[];
    };
    stabilization_mechanisms?: string[];
}

// Trace-Based Metrics (DeLanda Correction)
export type TraceType = "Rule" | "Enforcement" | "Narrative" | "Resource";
export type TraceDurability = "High" | "Medium" | "Low";

export interface AssemblageTrace {
    id: string;
    source_actor: string;
    target_actor?: string;
    content: string; // The verbatim evidence
    type: TraceType;
    durability: TraceDurability;
    description: string;
}

export interface AssemblageExtractionResult {
    assemblage: AssemblageObject;
    actors: AssemblageActor[];
    relations: AssemblageRelation[];
    traces: AssemblageTrace[]; // New: The evidence layer
    computed_metrics?: {
        territorialization: number;
        coding_intensity: number;
        territorialization_audit: string[];
        coding_audit: string[];
    };
    raw_response?: string;
}
