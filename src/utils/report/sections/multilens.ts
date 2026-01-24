import { ReportData } from "@/types/report";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

export function renderMultiLensAnalysis(generator: ReportGeneratorDOCX, data: ReportData["multiLens"]) {
    if (!data || !data.results) return;

    // Check if any results actually exist
    const hasResults = Object.values(data.results).some(r => r !== null);
    if (!hasResults) return;

    generator.addSectionHeader("Reflexive Multi-Lens Analysis", true);
    generator.addText("Theoretical Entanglement of: " + data.text.substring(0, 100) + "...", STYLE.colors.meta);

    // Iterate through known lenses
    const lenses = [
        { id: 'dsf', name: 'Decolonial Framework' },
        { id: 'cultural_framing', name: 'Cultural Framing' },
        { id: 'institutional_logics', name: 'Institutional Logics' },
        { id: 'legitimacy', name: 'Legitimacy Orders' }
    ];

    lenses.forEach(lens => {
        const result = data.results[lens.id as import("@/types/report").LensType];

        if (result) {
            generator.addSubHeader(lens.name);

            // Key Insight
            if (result.key_insight) {
                generator.addText("Key Insight:", STYLE.colors.secondary, 0, true);
                generator.addText(result.key_insight);
            }

            // Specific Fields based on lens type
            if (lens.id === 'cultural_framing') {
                if (result.dominant_cultural_logic) generator.addText(`Dominant Logic: ${result.dominant_cultural_logic}`);
                if (result.state_market_society) generator.addText(result.state_market_society);
            }

            if (lens.id === 'institutional_logics') {
                if (result.dominant_logic) generator.addText(`Dominant Logic: ${result.dominant_logic}`);
                if (result.overall_assessment) generator.addText(result.overall_assessment);
            }

            if (lens.id === 'legitimacy') {
                // Cast to any to access specific fields without importing the type locally if not needed
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const l = result as any;
                if (l.dominant_order) generator.addText(`Dominant Order: ${l.dominant_order}`);
                if (l.justification_logic) generator.addText(`Justification: ${l.justification_logic}`);
            }
        }
    });
}
