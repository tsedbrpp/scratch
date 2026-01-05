
export interface SynthesisComparisonResult {
    risk: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    governance: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    rights: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    scope: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    verified_quotes?: Array<{ text: string; source: string; relevance: string }>;
    system_critique?: {
        blind_spots: string[];
        over_interpretation: string;
        legitimacy_correction: string;
    } | string;
    assemblage_network?: {
        nodes: string[];
        edges: { from: string; to: string; type: string }[];
    };
}
