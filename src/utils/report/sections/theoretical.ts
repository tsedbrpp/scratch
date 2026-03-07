import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";
import { TEAAnalysis } from "@/types";

export function renderTheoreticalSynthesis(generator: ReportGeneratorDOCX, synthesisText?: string, teaData?: TEAAnalysis, teaImage?: string) {
    if (!synthesisText && !teaData) return;

    generator.addPageBreak();
    generator.addSectionHeader("Theoretical Translation");

    // --- 1. CLASSIC ANT & ASSEMBLAGE READING ---
    if (synthesisText) {
        generator.addSubHeader("Part I: ANT & Assemblage Theory");
        // Disclaimer
        generator.addText(
            "This section translates the empirical findings into high-level socio-technical theory concepts (Actor-Network Theory and Assemblage Theory).",
            STYLE.colors.meta,
            0,
            false // Not bold
        );
        generator.addSpacer();

        const lines = synthesisText.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                generator.addSpacer();
                continue;
            }

            if (trimmed.startsWith("Result") || trimmed.startsWith("Theoretical Implications")) {
                generator.addText(trimmed, STYLE.colors.primary, 0, true);
            } else if (trimmed.startsWith("ANT Reading:")) {
                generator.addText(trimmed, STYLE.colors.primary, 0, true);
            } else if (trimmed.startsWith("Assemblage Reading:")) {
                generator.addText(trimmed, STYLE.colors.primary, 0, true);
            } else {
                generator.addText(trimmed);
            }
        }
        generator.addSpacer();
    }

    // --- 2. POLICY PRISM SYNTHESIS ---
    if (teaData) {
        generator.addSubHeader("Part II: Policy Prism Synthesis");

        // Disclaimer
        generator.addText(
            "This section maps how governance vocabularies travel, translate, and embed into rigid infrastructures using the Policy Prism framework.",
            STYLE.colors.meta,
            0,
            false // Not bold
        );
        generator.addSpacer();

        if (teaImage) {
            generator.addImage(teaImage, 600, 300, "Figure 5: Policy Prism Synthesis Structure");
            generator.addSpacer();
        }

        // 1. Vocabularies
        if (teaData.vocabularies?.length > 0) {
            generator.addText("1. Portable Governance Vocabularies", STYLE.colors.secondary, 0, true);
            teaData.vocabularies.forEach(c => {
                generator.addText(`${c.term}:`, STYLE.colors.primary, 0, true);
                generator.addText(c.description, "000000", 1);
            });
            generator.addSpacer();
        }

        // 2. Translations
        if (teaData.translations?.length > 0) {
            generator.addText("2. Local Translations", STYLE.colors.secondary, 0, true);
            teaData.translations.forEach(r => {
                generator.addText(`${r.jurisdiction}:`, STYLE.colors.primary, 0, true);
                generator.addText(r.description, "000000", 1);
                if (r.referential_drift?.length > 0) {
                    generator.addText("Referential Drift:", "555555", 1, true);
                    r.referential_drift.forEach(d => generator.addText(`→ ${d}`, "000000", 2));
                }
            });
            generator.addSpacer();
        }

        // 3. Infrastructures
        if (teaData.embedding_infrastructures?.length > 0) {
            generator.addText("3. Embedding Infrastructures", STYLE.colors.secondary, 0, true);
            teaData.embedding_infrastructures.forEach(inf => {
                generator.addText(`${inf.name}:`, STYLE.colors.primary, 0, true);
                generator.addText(inf.description, "000000", 1);
            });
            // Legibility
            if (teaData.stratified_legibility) {
                generator.addText("Stratified Legibility:", "555555", 1, true);
                generator.addText(teaData.stratified_legibility.description, "000000", 1);
                generator.addText(`Highly Legible: ${teaData.stratified_legibility.highly_legible.join(', ')}`, "000000", 2);
                generator.addText(`Weakly Legible: ${teaData.stratified_legibility.weakly_legible.join(', ')}`, "000000", 2);
            }
            generator.addSpacer();
        }

        // 4. Apex Nodes
        if (teaData.apex_nodes?.length > 0) {
            generator.addText("4. Coordinating Apex Nodes", STYLE.colors.secondary, 0, true);
            teaData.apex_nodes.forEach(n => {
                generator.addText(`${n.name}:`, STYLE.colors.primary, 0, true);
                n.function.forEach(f => generator.addText(`• ${f}`, "000000", 1));
            });
            generator.addSpacer();
        }

        // 5. Contestations
        if (teaData.contestations?.length > 0) {
            generator.addText("5. Contestations", STYLE.colors.secondary, 0, true);
            teaData.contestations.forEach(o => {
                generator.addText(`${o.type.toUpperCase()}:`, STYLE.colors.primary, 0, true);
                generator.addText(o.description, "000000", 1);
                o.examples.forEach(e => generator.addText(`↳ ${e}`, "000000", 2));
                generator.addSpacer();
            });
        }

        // Narrative
        if (teaData.raw_synthesis_text) {
            generator.addText("Synthesis Narrative", STYLE.colors.secondary, 0, true);
            generator.addText(teaData.raw_synthesis_text);
        }
    }
}
