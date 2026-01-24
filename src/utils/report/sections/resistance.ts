import { ResistanceAnalysis, Source } from "@/types";
import { ReportData } from "@/types/report";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

export function renderResistanceTrace(generator: ReportGeneratorDOCX, source: Source) {
    if (!source.resistance_analysis) return;

    const r = source.resistance_analysis;
    generator.addSubHeader("Micro-Resistance Trace Analysis");

    generator.addText(`Strategy: ${r.strategy_detected}`, STYLE.colors.primary, 0, true);
    generator.addText(`Confidence: ${r.confidence}`, r.confidence === 'High' ? STYLE.colors.success : STYLE.colors.secondary, 0, true);

    if (r.evidence_quote) {
        generator.addText(`Evidence: "${r.evidence_quote}"`, STYLE.colors.subtle, 1);
    }

    if (r.interpretation) {
        generator.addText("Interpretation:", STYLE.colors.secondary, 0, true);
        generator.addText(r.interpretation);
    }
}

export function renderResistanceAnalysis(generator: ReportGeneratorDOCX, data: ReportData["resistance"]) {
    if (!data) return;
    generator.addSectionHeader("Micro-Resistance Analysis", true);

    if (data.executive_summary) {
        generator.addText(data.executive_summary);
    }

    if (data.dominant_strategies && data.dominant_strategies.length > 0) {
        generator.addSubHeader("Dominant Strategies");
        data.dominant_strategies.forEach((strat) => {
            generator.addText(strat.strategy, STYLE.colors.primary, 0, true);
            generator.addText(strat.description);
            generator.addText(`Frequency: ${strat.frequency}`, STYLE.colors.meta, 1);
            if (strat.minor_actor_verification) {
                generator.addText(`Minor Actor Signal: ${strat.minor_actor_verification}`, STYLE.colors.subtle, 1);
            }
            generator.addSpacer();
        });
    }

    if (data.lines_of_flight) {
        generator.addSubHeader("Lines of Flight (Deterritorialization)");
        generator.addText(data.lines_of_flight.narrative_aggregate);
        generator.addSpacer();

        if (data.lines_of_flight.vectors_of_deterritorialization) {
            generator.addText("Vectors of Deterritorialization:", STYLE.colors.secondary, 0, true);
            data.lines_of_flight.vectors_of_deterritorialization.forEach((vec) => {
                generator.addText(`• ${vec.name} (${vec.intensity}): ${vec.description}`, undefined, 1);
            });
            generator.addSpacer();
        }

        generator.addText(`Recapture Pressure: ${data.lines_of_flight.recapture_pressure}`, STYLE.colors.danger, 0, true);
    }

    if (data.implications_for_legitimacy) {
        generator.addSubHeader("Implications for Legitimacy");
        generator.addText(data.implications_for_legitimacy);
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderResistanceArtifacts(generator: ReportGeneratorDOCX, artifacts: any[]) {
    if (!artifacts || artifacts.length === 0) return;

    generator.addSectionHeader("Resistance Artifacts (Primary Data)", true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    artifacts.forEach((artifact: any, index: number) => {
        const title = artifact.title || `Artifact #${index + 1}`;
        generator.addSubHeader(title);

        if (artifact.type) generator.addText(`Type: ${artifact.type}`, STYLE.colors.meta);
        if (artifact.date) generator.addText(`Date: ${artifact.date}`, STYLE.colors.meta);
        if (artifact.source) generator.addText(`Source/Platform: ${artifact.source}`, STYLE.colors.meta);

        generator.addSpacer();

        if (artifact.content) {
            generator.addText("Content / Excerpt:", STYLE.colors.secondary, 0, true);
            generator.addText(`"${artifact.content}"`, STYLE.colors.subtle, 1);
        }

        if (artifact.analysis) {
            generator.addText("Trace Analysis:", STYLE.colors.secondary, 0, true);
            if (artifact.analysis.tactic) generator.addText(`• Tactic: ${artifact.analysis.tactic}`, undefined, 1);
            if (artifact.analysis.target) generator.addText(`• Target: ${artifact.analysis.target}`, undefined, 1);
            if (artifact.analysis.effect) generator.addText(`• Effect: ${artifact.analysis.effect}`, undefined, 1);
        }
        generator.addSpacer();
    });
}
