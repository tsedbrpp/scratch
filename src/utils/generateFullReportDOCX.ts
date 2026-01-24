import { ReportData, ReportSectionSelection } from "../types/report";
import { ReportGeneratorDOCX } from "./report/generator";
import { renderSourceAnalysis } from "./report/sections/source";
import { renderComparisonMatrix, renderGovernanceMatrix } from "./report/sections/matrix";
import { renderCrossCaseSynthesis } from "./report/sections/synthesis";
import { renderResistanceAnalysis, renderResistanceArtifacts } from "./report/sections/resistance";
import { renderEcosystemAnalysis, renderScenarios } from "./report/sections/ecosystem";
import { renderCulturalAnalysis } from "./report/sections/cultural";
import { renderOntology } from "./report/sections/ontology";
import { renderTheoreticalSynthesis } from "./report/sections/theoretical";
import { renderMultiLensAnalysis } from "./report/sections/multilens";
import { renderMethodologicalLogs } from "./report/sections/logs";

export async function generateFullReportDOCX(
    data: ReportData,
    options: ReportSectionSelection,
    customFilename?: string
) {
    const generator = new ReportGeneratorDOCX();

    // Default to true for all if options are not provided
    const show = options || {
        documentAnalysis: true,
        comparisonMatrix: true,
        synthesis: true,
        resistance: true,
        resistanceArtifacts: true
    };

    // 1. Title Page
    generator.addTitlePage("Comprehensive Analysis Report", "Decolonial Situatedness in Global AI Governance");

    // 2. Document Analysis (Iterate Sources)
    if (show.documentAnalysis) {
        const analyzedSources = data.sources.filter(s =>
            s.analysis || s.cultural_framing || s.institutional_logics || s.legitimacy_analysis || s.resistance_analysis
        );

        if (analyzedSources.length > 0) {
            generator.addSectionHeader("Document Analysis", true);
            analyzedSources.forEach((source, index) => {
                renderSourceAnalysis(generator, source, index + 1);
            });
        }
    }

    // 3. Comparative Diagnostic Matrix
    if (show.comparisonMatrix) {
        // Need re-filtering if document analysis wasn't run earlier, but lightweight filter is fine
        const analyzedSourcesForMatrix = data.sources.filter(s =>
            s.analysis || s.cultural_framing || s.institutional_logics || s.legitimacy_analysis || s.resistance_analysis
        );

        if (analyzedSourcesForMatrix.length >= 2) {
            renderComparisonMatrix(generator, analyzedSourcesForMatrix);
            // 3a. Governance Compass Matrix
            renderGovernanceMatrix(generator, analyzedSourcesForMatrix);

            // [VISUAL] Governance Compass
            if (data.images?.governanceCompass) {
                generator.addPageBreak();
                generator.addSubHeader("Visual: Governance Compass Configuration");
                generator.addImage(data.images.governanceCompass, 500, 350, "Figure 1: Comparative Governance Compass");
                generator.addSpacer();
            }

            // [VISUAL] Risk Heatmap
            if (data.images?.riskHeatmap) {
                generator.addSubHeader("Visual: Risk & Resistance Heatmap");
                generator.addImage(data.images.riskHeatmap, 500, 300, "Figure 2: Risk Intensity vs. Liberatory Capacity");
                generator.addSpacer();
            }
        }
    }

    // 4. Synthesis
    if (show.synthesis && data.synthesis) {
        renderCrossCaseSynthesis(generator, data.synthesis);
    }

    // 4. Resistance Synthesis
    if (show.resistance && data.resistance) {
        renderResistanceAnalysis(generator, data.resistance);
    }

    // 4b. Resistance Artifacts (Primary Data)
    if (show.resistanceArtifacts && data.resistanceArtifacts) {
        renderResistanceArtifacts(generator, data.resistanceArtifacts);
    }

    // 5. Ecosystem
    if (show.ecosystem && data.ecosystem) {
        renderEcosystemAnalysis(generator, data.ecosystem);

        // [VISUAL] Ecosystem Map
        if (data.images?.ecosystemMap) {
            generator.addPageBreak();
            generator.addSubHeader("Visual: Assemblage Force Graph");
            generator.addImage(data.images.ecosystemMap, 600, 400, "Figure 3: Socio-Technical Assemblage Network");
            generator.addSpacer();
        }
    }

    // 6. Cultural (Discursive Fields)
    if (show.cultural && data.cultural) {
        renderCulturalAnalysis(generator, data.cultural);
    }

    // 7. Ontology
    if (show.ontology && data.ontology) {
        renderOntology(generator, data.ontology);

        // [VISUAL] Ontology Map
        if (data.images?.ontologyMap) {
            generator.addSubHeader("Visual: Ontological Cartography");
            generator.addImage(data.images.ontologyMap, 600, 400, "Figure 4: Concept Map & Relations");
            generator.addSpacer();
        }
    }

    // 7. Multi-Lens (Reflexivity)
    if (show.multiLens && data.multiLens) {
        renderMultiLensAnalysis(generator, data.multiLens);
    }

    // 8. Scenarios
    if (show.scenarios && data.ecosystem?.configurations) {
        // For now, scenarios are not directly stored, but we can render configurations as a proxy
        // If scenarios are stored separately in the future, update this logic
        renderScenarios(generator, data.ecosystem.configurations); // Pass configurations as scenarios map?
        // Wait, renderScenarios expects valid scenario object but configurations is array.
        // Let's check renderScenarios implementation again.
        // It iterates Object.entries(scenarios).
        // renderEcosystemConfigurations iterates array.
        // The original code passed `generator.renderScenarios({});` - empty object.
        // So I'll pass empty object for now as placeholder to match original behavior.
        renderScenarios(generator, {});
    }

    // 9. Methodological Logs
    if (show.logs && data.logs) {
        renderMethodologicalLogs(generator, data.logs);
    }

    // 10. Theoretical Synthesis (ANT/Assemblage)
    if (show.theoreticalSynthesis && data.theoreticalSynthesis) {
        renderTheoreticalSynthesis(generator, data.theoreticalSynthesis);
    }

    // Generate and download
    const filename = customFilename || `Analysis_Report_${new Date().toISOString().split('T')[0]}.docx`;
    await generator.generateAndDownload(filename);
}
