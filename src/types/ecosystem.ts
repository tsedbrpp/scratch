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

export interface BridgingConcept {
    concept: string;
    explanation: string;
}

export interface CulturalHole {
    id: string;
    clusterA: string;
    clusterB: string;
    distance: number;
    bridgingConcepts: BridgingConcept[];
    opportunity: string;
    policyImplication: string;
}

export interface CulturalHolesAnalysisResult {
    summary: string;
    overall_connectivity_score: number;
    holes: CulturalHole[];
    silences?: { id: string; name: string; category: string; keywords: string[] }[];
    recommendations?: { role: string; action: string }[];
}
