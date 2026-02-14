
export type MediatorClassification =
    | 'strong_intermediary'  // 0.0-0.3
    | 'weak_intermediary'    // 0.3-0.5
    | 'weak_mediator'        // 0.5-0.7
    | 'strong_mediator';     // 0.7-1.0

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DimensionScore {
    score: number; // 0.0-1.0
    justification: string;
    confidence: ConfidenceLevel;
}

export interface MediatorDimensions {
    transformation: DimensionScore;
    stability: DimensionScore;
    multiplicity: DimensionScore;
    generativity: DimensionScore;
    contestation: DimensionScore;
}

export interface RelationshipHistory {
    date: string; // ISO 8601
    mediatorScore: number;
    event: string;
    notes?: string;
}

export interface Relationship {
    id: string;
    source: string; // Actor ID
    target: string; // Actor ID
    type: string; // "regulates", "advises", "implements", etc.

    // Mediator classification
    mediatorScore: number; // 0.0-1.0
    classification: MediatorClassification;
    dimensions: MediatorDimensions;

    // Empirical grounding
    empiricalTraces: string[];

    // Optional fields
    strength?: number; // 0.0-1.0 (relationship strength, independent of mediator score)
    history?: RelationshipHistory[];
    metadata?: {
        analyzedAt: string;
        aiModel: string;
        confidence: ConfidenceLevel;
    };
}

// Helper function to compute classification from score
export function getMediatorClassification(score: number): MediatorClassification {
    if (score < 0.3) return 'strong_intermediary';
    if (score < 0.5) return 'weak_intermediary';
    if (score < 0.7) return 'weak_mediator';
    return 'strong_mediator';
}

// Helper for Visual Properties (to be used in 3D views)
export function getMediatorVisuals(score: number) {
    const classification = getMediatorClassification(score);
    switch (classification) {
        case 'strong_intermediary': return { color: '#64748B', label: 'Strong Intermediary' }; // Slate-500
        case 'weak_intermediary': return { color: '#94A3B8', label: 'Weak Intermediary' }; // Slate-400
        case 'weak_mediator': return { color: '#FB923C', label: 'Weak Mediator' }; // Orange-400
        case 'strong_mediator': return { color: '#EF4444', label: 'Strong Mediator' }; // Red-500
    }
}
