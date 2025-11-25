// Cultural Analysis Type Definitions

export interface DiscourseCluster {
    id: string;
    name: string;
    description?: string; // AI-generated explanation of what this cluster represents
    themes: string[];
    sources: string[]; // Source IDs
    centroid: number[]; // Embedding vector
    size: number; // Number of themes in cluster
    quotes?: string[]; // Evidence/citations for the themes
}

export interface BridgingConcept {
    concept: string;
    explanation: string;
}

export interface CulturalHole {
    id: string;
    clusterA: string;
    clusterB: string;
    distance: number; // 0-1, higher = bigger gap
    bridgingConcepts: BridgingConcept[];
    opportunity: string; // Description of innovation potential
    policyImplication: string;
}

export interface CulturalAnalysisResult {
    summary?: string;
    clusters: DiscourseCluster[];
    holes: CulturalHole[];
    timestamp: string;
}

export interface ThemeExtraction {
    sourceId: string;
    sourceTitle: string;
    themes: string[];
    embeddings: number[][];
}
