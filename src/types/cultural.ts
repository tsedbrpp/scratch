// Cultural Analysis Type Definitions

export interface DiscourseCluster {
    id: string;
    name: string;
    description?: string; // AI-generated explanation of what this cluster represents
    themes: string[];
    sources: string[]; // Source IDs
    centroid: number[]; // Embedding vector
    size: number; // Number of themes in cluster
    quotes?: { text: string; source: string }[]; // Evidence/citations for the themes
}

export interface CulturalAnalysisResult {
    summary?: string;
    clusters: DiscourseCluster[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    silences?: any[]; // Keep flexible for now or import from ontology
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cultural_framing?: any; // Keep flexible
    overall_connectivity_score?: number;
    timestamp: string;
}

export interface ThemeExtraction {
    sourceId: string;
    sourceTitle: string;
    themes: string[];
    embeddings: number[][];
}

export interface ThemeObject {
    theme: string;
    quote: string;
}
