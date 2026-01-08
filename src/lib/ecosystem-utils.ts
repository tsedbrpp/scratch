
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

            baseActors.push({
                id: `ghost-${absent.name.replace(/\s+/g, '-')}`,
                name: absent.name,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: (absent.role || absent.category || "Civil Society") as any, // Cast to match stricter type if needed
                description: absent.reason || "Structurally absent actor",
                metrics: { influence: 1, resistance: 0, alignment: 1 },
                influence: "Low",
                isGhost: true // Flag for rendering
            });
        });
    }
    return baseActors as GhostActor[];
};
