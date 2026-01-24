import { AnalysisResult } from "@/types";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

export function renderGovernanceAnalysis(generator: ReportGeneratorDOCX, analysis: AnalysisResult) {
    if (!analysis.governance_scores) return;

    generator.addSubHeader("Governance Compass & Decolonial Analysis (DSF)");

    const g = analysis.governance_scores;
    const gScores = `• Centralization: ${g.centralization}\n• Rights Focus: ${g.rights_focus}\n• Flexibility: ${g.flexibility}\n• Market Power: ${g.market_power}\n• Procedurality: ${g.procedurality}`;
    generator.addText(gScores);

    if (analysis.key_insight) {
        generator.addText("Key Insight:", STYLE.colors.secondary, 0, true);
        generator.addText(analysis.key_insight);
    }

    // Qualitative Analysis Fields
    if (analysis.governance_power_accountability) {
        generator.addText("Governance, Power & Accountability:", STYLE.colors.secondary, 0, true);
        generator.addText(analysis.governance_power_accountability);
    }
    if (analysis.plurality_inclusion_embodiment) {
        generator.addText("Plurality & Inclusion:", STYLE.colors.secondary, 0, true);
        generator.addText(analysis.plurality_inclusion_embodiment);
    }
    if (analysis.agency_codesign_self_determination) {
        generator.addText("Agency & Self-Determination:", STYLE.colors.secondary, 0, true);
        generator.addText(analysis.agency_codesign_self_determination);
    }
    if (analysis.reflexivity_situated_praxis) {
        generator.addText("Reflexivity & Situated Praxis:", STYLE.colors.secondary, 0, true);
        generator.addText(analysis.reflexivity_situated_praxis);
    }

    // [NEW] Coloniality of Power
    if (analysis.coloniality_of_power) {
        generator.addText("Coloniality of Power (Center-Periphery):", STYLE.colors.secondary, 0, true);
        generator.addText(analysis.coloniality_of_power);
    }

    renderAssemblageDynamics(generator, analysis);
    renderStructuralPillars(generator, analysis);
    renderGovernanceScoreExplanations(generator, analysis);
}

function renderAssemblageDynamics(generator: ReportGeneratorDOCX, analysis: AnalysisResult) {
    if (analysis.assemblage_dynamics) {
        generator.addSubHeader("Assemblage Dynamics");
        const dyn = analysis.assemblage_dynamics;
        generator.addText(`• Territorialization: ${dyn.territorialization}`);
        generator.addText(`• Deterritorialization: ${dyn.deterritorialization}`);
        generator.addText(`• Coding: ${dyn.coding}`);
    }
}

function renderStructuralPillars(generator: ReportGeneratorDOCX, analysis: AnalysisResult) {
    if (analysis.structural_pillars) {
        generator.addSubHeader("Structural Pillars");
        const pillars = analysis.structural_pillars;
        if (pillars.risk) generator.addText(`Risk: ${pillars.risk.description} (${pillars.risk.badge})`);
        if (pillars.rights) generator.addText(`Rights: ${pillars.rights.description} (${pillars.rights.badge})`);
        if (pillars.enforcement) generator.addText(`Enforcement: ${pillars.enforcement.description} (${pillars.enforcement.badge})`);
        if (pillars.scope) generator.addText(`Scope: ${pillars.scope.description} (${pillars.scope.badge})`);
    }
}

function renderGovernanceScoreExplanations(generator: ReportGeneratorDOCX, analysis: AnalysisResult) {
    if (analysis.governance_score_explanations) {
        generator.addText("Score Explanations:", STYLE.colors.secondary, 0, true);
        const e = analysis.governance_score_explanations;
        let expl = "";
        if (e.centralization) expl += `• Centralization: ${e.centralization}\n`;
        if (e.rights_focus) expl += `• Rights Focus: ${e.rights_focus}\n`;
        if (e.flexibility) expl += `• Flexibility: ${e.flexibility}`;
        if (e.market_power) expl += `\n• Market Power: ${e.market_power}`;
        if (e.procedurality) expl += `\n• Procedurality: ${e.procedurality}`;
        if (e.coloniality) expl += `\n• Coloniality: ${e.coloniality}`;
        generator.addText(expl);
    }
}
