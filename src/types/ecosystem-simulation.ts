import { SimulationNode } from '@/hooks/useForceGraph';

export interface TerritorializationActor {
    id: string;
    classification: 'highly_stabilized' | 'stabilized' | 'marginal' | 'peripheral' | 'resistant';
    forceStrength: number;
    reason: string;
}

export interface TerritorializationData {
    actors: TerritorializationActor[];
    explanation: string;
    mechanisms: string[];
    timestamp?: string;
}

export interface DeterritorializationData {
    nodes: Array<{ name: string; index?: number }>;
    links: Array<{ source: number; target: number; value: number }>;
    explanation: string;
    tactics?: {
        capture: string[];
        escape: string[];
    };
    matrix?: Array<{
        name: string;
        x: number;
        y: number;
        type: string;
    }>;
    timestamp?: string;
}

export interface SimulationProps {
    isExpanded: boolean;
    nodes: SimulationNode[];
}
