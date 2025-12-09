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
}

export interface EcosystemConfiguration {
    id: string;
    name: string;
    description: string;
    memberIds: string[];
    properties: {
        stability: "High" | "Medium" | "Low";
        generativity: "High" | "Medium" | "Low";
        [key: string]: string;
    };
    color: string;
}

export interface CulturalHole {
    concept: string;
    significance: "High" | "Medium" | "Low";
    description: string;
    between: string[];
    scores?: Record<string, number>;
    bridgingConcepts?: { concept: string; description: string }[];
}

export interface CulturalHolesAnalysisResult {
    summary: string;
    overall_connectivity_score: number;
    holes: CulturalHole[];
    silences?: { id: string; name: string; category: string; keywords: string[] }[];
    recommendations: { role: string; action: string }[];
}
