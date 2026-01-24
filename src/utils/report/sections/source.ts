import { Source } from "@/types";
import { Paragraph, TextRun, BorderStyle } from "docx";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";
import { renderCulturalFraming } from "./cultural";
import { renderInstitutionalLogics } from "./logics";
import { renderLegitimacyAnalysis } from "./legitimacy";
import { renderGovernanceAnalysis } from "./governance";
import { renderResistanceTrace } from "./resistance";
import { renderDataPageCalculations } from "./risk-data";

export function renderSourceAnalysis(generator: ReportGeneratorDOCX, source: Source, index: number) {
    const titleRun = new TextRun({
        text: `${index}. ${source.title}`,
        font: STYLE.fonts.header,
        color: STYLE.colors.primary,
        size: STYLE.sizes.header,
        bold: true,
    });

    generator.sections.push(
        new Paragraph({
            children: [titleRun],
            spacing: { before: 400, after: 200 },
            pageBreakBefore: true,
            shading: {
                fill: STYLE.colors.accent,
                type: "clear",
                color: "auto",
            },
            border: {
                left: { color: STYLE.colors.primary, space: 10, style: BorderStyle.SINGLE, size: 6 }
            }
        })
    );

    const metaText = `TYPE: ${source.type.toUpperCase()}  |  ADDED: ${source.addedDate}  |  STATUS: ${source.status}`;
    generator.sections.push(
        new Paragraph({
            text: metaText,
            spacing: { after: 400 },
            run: {
                font: STYLE.fonts.normal,
                color: STYLE.colors.meta,
                size: STYLE.sizes.meta,
            }
        })
    );

    // 1. Core Analysis (Governance, etc)
    if (source.analysis || source.cultural_framing || source.institutional_logics || source.legitimacy_analysis) {
        if (source.cultural_framing) renderCulturalFraming(generator, source.cultural_framing);
        if (source.institutional_logics) renderInstitutionalLogics(generator, source.institutional_logics);
        if (source.legitimacy_analysis) renderLegitimacyAnalysis(generator, source.legitimacy_analysis);
        if (source.analysis) renderGovernanceAnalysis(generator, source.analysis);

        // NEW: Data Page Specific Sections
        renderDataPageCalculations(generator, source);
    } else if (source.resistance_analysis) {
        // 1b. Resistance Trace Analysis
        renderResistanceTrace(generator, source);
    } else {
        generator.addText("No analysis data available for this source.", STYLE.colors.subtle);
    }
}
