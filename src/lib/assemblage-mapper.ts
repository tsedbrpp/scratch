import { EcosystemActor } from '@/types/ecosystem';
import { inferActorType } from '@/lib/ecosystem-utils';

export interface ApiActor {
    id?: string;
    name: string;
    type?: "PrivateTech" | "Policymaker" | "Civil Society" | "Academic" | "Infrastructure" | "Algorithm" | "Dataset" | "AlgorithmicAgent" | "LegalObject";
    description?: string;
    metrics?: {
        territorialization?: string | number;
        territoriality?: string | number;
        centrality?: string | number;
        counter_conduct?: string | number;
        discursive_opposition?: string | number;
        rationale?: string;
    };
    evidence_quotes?: string[];
    region?: "Global North" | "Global South" | "International" | "Unknown";
    role_type?: "Material" | "Expressive" | "Mixed";
    trace_metadata?: {
        source: "document_extraction" | "ai_inference" | "user_input";
        evidence: string;
        provisional: boolean;
        confidence: number;
    };
    reflexive_log?: import('@/types/ecosystem').ReflexiveLogEntry[];
}

export interface ApiImpact {
    actor?: string;
    mechanism?: string;
    impact?: string;
}

export interface ApiResponse {
    assemblage?: {
        name?: string;
        description?: string;
        properties: {
            stability?: "High" | "Medium" | "Low";
            generativity?: "High" | "Medium" | "Low";
            territorialization_score?: number;
            coding_intensity_score?: number;
        };
    };
    actors?: ApiActor[];
    impacts?: ApiImpact[];
}

export function mapApiResponseToAssemblage(analysis: ApiResponse): {
    newActors: EcosystemActor[];
    memberIds: string[];
} {
    const newActors: EcosystemActor[] = [];
    const memberIds: string[] = [];

    const firstActor = (analysis.actors && analysis.actors.length > 0) ? analysis.actors[0] : null;

    // 1. Service-Hydrated Actors (Best Path)
    if (firstActor && firstActor.id && firstActor.metrics && typeof firstActor.metrics.territorialization !== 'undefined') {
        if (analysis.actors) {
            analysis.actors.forEach((a: ApiActor) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                newActors.push(a as any as EcosystemActor);
                if (a.id) memberIds.push(a.id);
            });
        }
        return { newActors, memberIds };
    }

    // 2. Raw AI Response Analysis (Mapping Path)
    if (analysis.actors && Array.isArray(analysis.actors)) {
        analysis.actors.forEach((a: ApiActor) => {
            const m = a.metrics || {};
            const id = crypto.randomUUID();
            newActors.push({
                id,
                sourceId: 'ai-generated',
                name: a.name,
                type: a.type || 'Civil Society',
                description: a.description || `Identified as ${a.type}`,
                influence: "Medium",
                metrics: {
                    territorialization: "Moderate",
                    coding: "Moderate",
                    deterritorialization: "Moderate",
                    rationale: m.rationale || "No rationale provided.",
                    territoriality: m.territoriality as number | undefined,
                    centrality: m.centrality as number | undefined,
                    counter_conduct: m.counter_conduct as number | undefined,
                    discursive_opposition: m.discursive_opposition as number | undefined
                },
                quotes: a.evidence_quotes || [],
                region: a.region || "Unknown",
                role_type: a.role_type,
                trace_metadata: a.trace_metadata || {
                    source: "ai_inference",
                    evidence: (a.evidence_quotes && a.evidence_quotes[0]) || "Inferred from analysis",
                    provisional: true,
                    confidence: 0.85
                },
                reflexive_log: a.reflexive_log || []
            });
            memberIds.push(id);
        });
        return { newActors, memberIds };
    }

    // 3. Fallback: Impact Analysis (Worst Path)
    const impacts = analysis.impacts || [];
    const uniqueActors = new Set<string>();
    impacts.forEach((imp: ApiImpact) => {
        if (imp.actor) uniqueActors.add(imp.actor);
    });

    Array.from(uniqueActors).forEach(name => {
        const id = crypto.randomUUID();
        newActors.push({
            id,
            sourceId: 'ai-generated',
            name,
            type: inferActorType(name),
            description: `Actor identified via impact analysis.`,
            influence: "Medium",
            metrics: { territorialization: "Moderate", deterritorialization: "Moderate", coding: "Moderate" },
            quotes: [],
            region: "Unknown"
        });
        memberIds.push(id);
    });

    return { newActors, memberIds };
}
