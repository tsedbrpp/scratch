import { TheoryPanelData, DiagramConfig } from "./types";
import { ComparativeSynthesis, TEAAnalysis } from "@/types";

export function adaptSynthesisToTheoryMap(
    synthesis: ComparativeSynthesis | null,
    teaAnalysis: TEAAnalysis | null
): TheoryPanelData[] {
    if (!synthesis || !synthesis.key_divergences) return [];

    return synthesis.key_divergences.map((div, i): TheoryPanelData => {
        // Generate some stable, pseudo-random scores/visuals based on the index if not provided
        const themeIdx = i % 4;
        const themes: Array<"emerald" | "sky" | "rose" | "amber"> = ["emerald", "sky", "rose", "amber"];

        // Default config if missing
        const defaultDiagram: DiagramConfig = {
            nodes: [
                { id: "Concept", kind: "actor", x: 30, y: 50, label: "Concept" },
                { id: "Translation", kind: "document", x: 70, y: 50, label: "Translation" }
            ],
            edges: [{ from: "Concept", to: "Translation", style: "solid" }]
        };

        // Find a matching proposition from TEA analysis if available for the score
        // The comparative synthesis prompt generates scores on a 1-10 scale, so multiply by 10 for percentage coords.
        const legibilityScore = (div.tea?.legibility_score !== undefined ? div.tea.legibility_score * 10 : 50);
        let embeddingScore = (div.tea?.embedding_score !== undefined ? div.tea.embedding_score * 10 : 50);

        if (teaAnalysis?.propositions) {
            const embeddingProp = teaAnalysis.propositions.find(p => p.id === 'prop3'); // Prop 3 is Embedding
            if (embeddingProp?.support_level === 'strong') embeddingScore = 85;
            if (embeddingProp?.support_level === 'weak') embeddingScore = 20;
        }

        return {
            id: `theory-panel-${i}`,
            title: div.theme,
            tea: {
                term: div.tea?.term || "Governance Object",
                referent: div.tea?.referent || div.theme,
                effect: div.tea?.effect || "Unknown Embedding Effect",
                embeddingScore,
                legibilityScore,
                legibilityType: legibilityScore > 50 ? "public" : "distorted"
            },
            ant: {
                bullets: div.ant_bullets || ["No explicit ANT reading generated. Please rerun generation."],
                diagramConfig: defaultDiagram
            },
            assemblage: {
                bullets: div.assemblage_bullets || ["No explicit Assemblage reading generated. Please rerun generation."],
                diagramConfig: defaultDiagram
            },
            implication: div.implication || div.description,
            theme: themes[themeIdx]
        };
    });
}
