
import { EscalationStatus } from './escalation';

export interface SynthesisTopologyAxis {
    a_score: number;
    b_score: number;
    axis: string;
    anchors?: { low: string; high: string };
    description: string;
    evidence?: { a_quotes: string[]; b_quotes: string[] };
    confidence?: number; // 0-1
    decision_rule?: string;
}

export interface SynthesisComparisonResult {
    risk: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    governance: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    rights: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    scope: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    topology_analysis?: {
        risk: SynthesisTopologyAxis;
        governance: SynthesisTopologyAxis;
        rights: SynthesisTopologyAxis;
        scope: SynthesisTopologyAxis;
    };
    verified_quotes?: Array<{ text: string; source: string; relevance: string }>;
    system_critique?: {
        blind_spots: string[];
        over_interpretation: string;
        legitimacy_correction: string;
    } | string;
    assemblage_network?: {
        nodes: Array<{ id: string; type: 'policy' | 'concept' | 'mechanism' | 'right' | 'risk'; label: string; inferred_centrality?: string }>;
        edges: Array<{ from: string; to: string; type: 'reinforcing' | 'tension' | 'extraction' | 'resistance'; description?: string; weight?: number }>;
    };
    resonances?: {
        narrative: string;
        shared_strategies: string[];
        resonance_graph?: {
            nodes: Array<{
                id: string;
                label: string;
                type: 'shared' | 'eu_specific' | 'brazil_specific' | 'asymmetry';
                flight_intensity?: number; // 0-1, simulates 'lines of flight'
            }>;
            edges: Array<{
                from: string;
                to: string;
                type: 'resonance' | 'divergence' | 'colonial_influence' | 'flight';
                weight?: number;
            }>;
        };
    };
    // [NEW] Governance Status from Sources
    escalation_status?: {
        sourceA: EscalationStatus;
        sourceB: EscalationStatus;
    };
}
