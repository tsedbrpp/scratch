import { AnalysisResult } from "@/types";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

export function renderCulturalFraming(generator: ReportGeneratorDOCX, framing: AnalysisResult) {
    generator.addSubHeader("Cultural Framing Analysis");

    if (framing.dominant_cultural_logic) {
        generator.addText("Dominant Cultural Logic:", STYLE.colors.primary, 0, true);
        generator.addText(framing.dominant_cultural_logic, STYLE.colors.text, 0, true);
        generator.addSpacer();
    }

    if (framing.state_market_society) {
        generator.addText("State-Market-Society Relations:", STYLE.colors.secondary, 0, true);
        generator.addText(framing.state_market_society);
    }
    if (framing.technology_role) {
        generator.addText("Role of Technology:", STYLE.colors.secondary, 0, true);
        generator.addText(framing.technology_role);
    }
    if (framing.rights_conception) {
        generator.addText("Conception of Rights:", STYLE.colors.secondary, 0, true);
        generator.addText(framing.rights_conception);
    }

    // [NEW] Added Missing Fields
    if (framing.temporal_orientation) {
        generator.addText("Temporal Orientation:", STYLE.colors.secondary, 0, true);
        if (typeof framing.temporal_orientation === 'string') {
            generator.addText(framing.temporal_orientation);
        } else {
            // Handle object case (Micro-Fascism style)
            const t = framing.temporal_orientation;
            generator.addText(`${t.framing} (Score: ${t.score}/100) - ${t.evidence}`);
        }
    }
    if (framing.enforcement_culture) {
        generator.addText("Enforcement Culture:", STYLE.colors.secondary, 0, true);
        generator.addText(framing.enforcement_culture);
    }

    // [NEW] Historical & Epistemic
    if (framing.historical_context) {
        generator.addText("Historical Context:", STYLE.colors.secondary, 0, true);
        generator.addText(framing.historical_context);
    }
    if (framing.epistemic_authority) {
        generator.addText("Epistemic Authority:", STYLE.colors.secondary, 0, true);
        generator.addText(framing.epistemic_authority);
    }
    if (framing.cultural_distinctiveness_score !== undefined) {
        generator.addText(`Cultural Distinctiveness Score: ${framing.cultural_distinctiveness_score}/1.0`, STYLE.colors.meta, 0, true);
        generator.addSpacer();
    }

    if (framing.silenced_voices && framing.silenced_voices.length > 0) {
        generator.addText("Silenced Voices:", STYLE.colors.danger, 0, true);
        framing.silenced_voices.forEach(voice => generator.addText(`• ${voice}`, undefined, 1));
    }
}

import { CulturalAnalysisResult } from "@/types/cultural";

export function renderCulturalAnalysis(generator: ReportGeneratorDOCX, data: CulturalAnalysisResult | null) {
    if (!data) return;
    generator.addSectionHeader("Cultural Framing of Discursive Fields", true);

    if (data.summary) {
        generator.addText(data.summary);
        generator.addSpacer();
    }

    // Clusters
    if (data.clusters && data.clusters.length > 0) {
        generator.addSubHeader("Discourse Clusters");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.clusters.forEach((cluster: any) => {
            generator.addText(`${cluster.name} (Size: ${cluster.size})`, STYLE.colors.primary, 0, true);
            if (cluster.description) {
                generator.addText(cluster.description, STYLE.colors.secondary);
            }

            generator.addText("Themes: " + cluster.themes.join(", "), STYLE.colors.meta);

            if (cluster.quotes && cluster.quotes.length > 0) {
                generator.addText("Evidence:", STYLE.colors.secondary, 0, true);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cluster.quotes.slice(0, 3).forEach((q: any) => generator.addText(`"${q.text}" (${q.source})`, STYLE.colors.subtle));
            }
            generator.addSpacer();
        });
    }
}
