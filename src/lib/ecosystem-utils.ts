
import { EcosystemActor, AssemblageAnalysis, AiAbsenceAnalysis } from "@/types/ecosystem";

// --- Swiss Design System Constants ---
export const SWISS_COLORS = {
    // Categorical Palette (Sophisticated/Muted)
    policymaker: "#2563EB", // Strong Blue
    civilsociety: "#D97706", // Amber/Gold
    startup: "#7C3AED", // Vivid Purple
    academic: "#059669", // Emerald Green
    infrastructure: "#475569", // Slate
    algorithm: "#DC2626", // Red
    dataset: "#0891B2", // Cyan
    default: "#94A3B8"
};

export const getActorColor = (type: string) => {
    const key = type.toLowerCase().replace(" ", "") as keyof typeof SWISS_COLORS;
    return SWISS_COLORS[key] || SWISS_COLORS.default;
};

export type ActorShape = "circle" | "rect" | "triangle" | "square" | "hexagon";

export const getActorShape = (type: string): ActorShape => {
    const t = type.toLowerCase();
    if (t.includes('infrastructure') || t.includes('dataset')) return 'hexagon';
    if (t.includes('algorithm') || t.includes('model') || t.includes('algorithmic')) return 'triangle';
    if (t.includes('startup') || t.includes('company')) return 'square';
    if (t.includes('legal') || t.includes('law')) return 'rect';
    return 'circle'; // Policymaker, Academic, Civil Society
};

export interface GhostActor extends EcosystemActor {
    isGhost: boolean;
}

export const mergeGhostNodes = (actors: EcosystemActor[], absenceAnalysis: AssemblageAnalysis | AiAbsenceAnalysis | null): GhostActor[] => {
    const baseActors: GhostActor[] = actors.map(a => ({ ...a, isGhost: false }));
    if (!absenceAnalysis) return baseActors;

    // Handle potentially different data shapes (absent_actors vs missing_voices)
    // Cast to any for checking property existence safely if types overlap poorly, 
    // OR refine types. 'missing_voices' exists in both. 'absent_actors' is likely internal or old.
    // Let's refine based on the types we saw in 'types/ecosystem.ts'.
    // AssemblageAnalysis defines: missing_voices
    // AiAbsenceAnalysis defines: missing_voices
    // Neither seems to define 'absent_actors' in the file I saw, but code referenced it. 
    // I will keep the check but type it lightly or just check missing_voices.

    // Actually, looking at types/ecosystem.ts, both have 'missing_voices'. 
    // I will use that as the primary source.
    const absences = absenceAnalysis.missing_voices || [];

    if (absences.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        absences.forEach((absent: any) => {
            // Ensure we have a valid name before adding
            if (!absent.name) return;

            // Normalize type to ensure connections
            let normalizedType = "Civil Society"; // Default fallback
            const role = (absent.role || absent.category || "").toLowerCase();

            if (role.includes("government") || role.includes("state") || role.includes("ministry")) normalizedType = "Policymaker";
            else if (role.includes("academic") || role.includes("research") || role.includes("expert")) normalizedType = "Academic";
            else if (role.includes("startup") || role.includes("business") || role.includes("private")) normalizedType = "Startup";
            else if (role.includes("infra") || role.includes("platform")) normalizedType = "Infrastructure";
            else if (role.includes("data") || role.includes("set")) normalizedType = "Dataset";
            else if (role.includes("algo") || role.includes("ai")) normalizedType = "Algorithm";
            else if (role.includes("agent")) normalizedType = "AlgorithmicAgent";
            else if (role.includes("law") || role.includes("legal")) normalizedType = "LegalObject";

            baseActors.push({
                id: `ghost-${absent.name.replace(/\s+/g, '-')}`,
                name: absent.name,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: normalizedType as any,
                description: absent.reason || "Structurally absent actor",
                metrics: {
                    territorialization: "Weak",
                    deterritorialization: "Strong",
                    coding: "Weak"
                },
                influence: "Low",
                isGhost: true // Flag for rendering
            });
        });
    }
    return baseActors as GhostActor[];
};

export const inferActorType = (name: string): EcosystemActor['type'] => {
    const n = name.toLowerCase();
    if (n.includes("ministry") || n.includes("agency") || n.includes("commission") || n.includes("eu ")) return "Policymaker";
    if (n.includes("university") || n.includes("institute") || n.includes("lab")) return "Academic";
    if (n.includes("corp") || n.includes("inc") || n.includes("ltd") || n.includes("startup")) return "Startup";
    if (n.includes("foundation") || n.includes("ngo") || n.includes("association") || n.includes("union")) return "Civil Society";
    if (n.includes("platform") || n.includes("cloud") || n.includes("server") || n.includes("api")) return "Infrastructure";
    if (n.includes("algorithm") || n.includes("model") || n.includes("ai ") || n.includes("risk score") || n.includes("classifier")) return "Algorithm";
    if (n.includes("dataset") || n.includes("training data") || n.includes("registry") || n.includes("benchmark")) return "Dataset";
    return "Civil Society"; // Default
};

// [NEW] Shared Metric Calculation
// Avoids circular dependency by accepting edges or generating them if we move generateEdges here? 
// Actually, circular dependency risk: graph-utils imports types, ecosystem-utils imports types. Safe.
// But we need to import generateEdges from graph-utils.
import { generateEdges } from '@/lib/graph-utils';
import { EcosystemConfiguration } from "@/types/ecosystem";

export const calculateAssemblageMetrics = (actors: EcosystemActor[], config: EcosystemConfiguration | null, excludedActorIds: string[] = []) => {
    if (!config || !actors.length) return { porosity: 0, stability: 0, internal: 0, external: 0, coding_intensity: 0, health: 0 };

    // Filter actors first
    const activeActors = actors.filter(a => !excludedActorIds.includes(a.id));
    const memberIds = config.memberIds || []; // Safe fallback
    const memberSet = new Set(memberIds.filter(id => !excludedActorIds.includes(id)));

    // If we removed all members, return 0
    if (memberSet.size === 0) return { porosity: 0, stability: 0, internal: 0, external: 0, coding_intensity: 0, health: 0 };

    // Use generateEdges to get all potential links based on types
    const edges = generateEdges(activeActors);

    let internal = 0;
    let external = 0;

    edges.forEach(edge => {
        const sIn = memberSet.has(edge.source.id);
        const tIn = memberSet.has(edge.target.id);

        if (sIn && tIn) internal++;
        else if (sIn || tIn) external++;
    });

    const total = internal + external;
    const porosity = total > 0 ? external / total : 0; // High external links = High Porosity
    const stability = total > 0 ? internal / total : 0; // High internal links = High Stability (Territorialization)

    // [NEW] Coding Intensity: Based on Type Homogeneity (Shannon Entropy)
    // High Coding = Low Entropy (Uniform types, strict sorting)
    // Low Coding = High Entropy (Heterogeneous mixing)
    const members = activeActors.filter(a => memberSet.has(a.id));
    const typeCounts: Record<string, number> = {};
    members.forEach(m => {
        typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });

    const frequencies = Object.values(typeCounts).map(count => count / members.length);
    const entropy = frequencies.reduce((sum, p) => sum - p * Math.log(p), 0);
    // Normalize entropy (Max entropy = log(numTypes)) - defaulting to 1 if mainly 1 type is possible? 
    // Max entropy for N items is log(N), or log(num_categories). We have ~9 categories.
    const maxEntropy = Math.log(9);
    const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;

    // Coding Intensity = 1 - Entropy (High Homogeneity = High Coding)
    const coding_intensity = 1 - normalizedEntropy;

    const health = stability * coding_intensity * activeActors.length;

    return {
        porosity,
        stability,
        internal,
        external,
        coding_intensity,
        health
    };
};

