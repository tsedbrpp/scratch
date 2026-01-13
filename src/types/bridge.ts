import { EcosystemActor, EcosystemEdge } from '@/types/ecosystem';

/**
 * Data Contract: The `AssemblageExport` Interface (Refined for Theoretical Fidelity)
 * 
 * To balance stability (ANT traceability) with fluidity (Assemblage becoming), exports are treated as 
 * **provisional snapshots**, not frozen ontologies.
 */
export interface AssemblageExport {
    id: string; // Assemblage ID
    policyId: string; // Source Document ID
    generatedAt: string; // ISO Date
    version: number; // Supports 'Provisional Persistence'
    status: 'draft' | 'stable'; // 'Draft' implies active territorialization

    // Reflexive Metadata
    analyst: {
        id: string;
        positionality?: string; // e.g., "Global North Legal Lens"
    };

    // Structural Data
    nodes: EcosystemActor[];
    edges?: EcosystemEdge[]; // Optional as edges might be implicit in some views

    // Narrative Data (Single Source of Truth)
    impactNarrative: {
        summary: string;
        constraints: string[];
        affordances: string[];
        provenance: 'ecosystem_generated' | 'synthesis_reinterpreted'; // Tracks translation
    };

    // Topology Data (for Comparison)
    topology: {
        territorializationScore: number;
        codingIntensityScore: number;
    };
}
