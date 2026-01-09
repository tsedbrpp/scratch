/**
 * Assemblage Theory Types (DeLanda) - Realist Ontology
 * These types represent the ontological layer - explanatory mechanisms and capacities
 * 
 * Key Principle: Assemblage Theory provides ONTOLOGICAL explanations, not just descriptions
 * Requires ANT traces as empirical foundation
 * 
 * Note: This is separate from legacy assemblage.ts for backward compatibility
 */

import { TracedActor } from './ant';

export type MechanismType =
    | "territorialization"    // Boundary-making, stabilization
    | "deterritorialization"  // Boundary-crossing, destabilization
    | "coding"                // Homogenization, standardization
    | "decoding"              // Differentiation, heterogenization
    | "sorting";              // Inclusion/exclusion operations

export interface AssemblageMechanism {
    type: MechanismType;
    intensity: number; // 0-1
    evidence: TracedActor[]; // Grounded in ANT traces
    explanation: string;
    confidence: number; // 0-1
}

export interface AssemblageCapacity {
    name: string;
    description: string;
    enabled_by: string[]; // Actor IDs
    blocked_by: string[]; // Actor IDs
    actual: boolean; // Currently realized
    potential: boolean; // Could be realized
    evidence: string;
}

export interface HullMetrics {
    // ANT-inspired flow metrics (methodological)
    flow_metrics: {
        porosity: number; // External connections ratio
        connectivity: number; // Network density
        label: "ANT Flow Analysis";
    };

    // DeLandian realist metrics (ontological)
    realist_metrics: {
        territorialization: number; // Boundary-making intensity
        coding_intensity: number; // Homogenization strength
        capacity_score: number; // Potential vs. actual
        label: "Assemblage Mechanism Analysis";
    };
}

export interface AssemblageAnalysisResult {
    mode: "assemblage_realist";
    detected_mechanisms: AssemblageMechanism[];
    identified_capacities: AssemblageCapacity[];
    territorialization_metrics: HullMetrics;
    explanatory_narrative: string;

    // Requires ANT trace as input
    based_on_trace: {
        actor_count: number;
        association_count: number;
    };
}
