import { ReportData } from "@/types/report";
import { Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle } from "docx";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";
import { sanitizeText } from "../helpers";

export function renderEcosystemAnalysis(generator: ReportGeneratorDOCX, data: ReportData["ecosystem"]) {
    if (!data) return;
    generator.addSectionHeader("Ecosystem & Assemblage Analysis", true);

    if (data.actors) renderEcosystemActors(generator, data.actors);
    if (data.configurations) renderEcosystemConfigurations(generator, data.configurations);
    if (data.absenceAnalysis) renderAbsenceAnalysis(generator, data.absenceAnalysis);
    if (data.assemblage) renderAssemblageAnalysis(generator, data.assemblage);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderEcosystemActors(generator: ReportGeneratorDOCX, actors: any[]) {
    if (actors.length === 0) return;

    generator.addSubHeader("Key Ecosystem Actors");

    // Create Table Rows
    const headerRow = new TableRow({
        children: [
            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Actor Name", run: { bold: true } })] }),
            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Type", run: { bold: true } })] }),
            new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Infl.", run: { bold: true } })] }),
            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Context", run: { bold: true } })] }),
            new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Description", run: { bold: true } })] }),
        ],
        tableHeader: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = actors.map((actor: any) => new TableRow({
        children: [
            new TableCell({ children: [new Paragraph(actor.name)] }),
            new TableCell({ children: [new Paragraph(actor.type)] }),
            new TableCell({ children: [new Paragraph(actor.influence)] }),
            new TableCell({ children: [new Paragraph(actor.materialized_from?.context_type || "Direct")] }),
            new TableCell({ children: [new Paragraph(sanitizeText(actor.description || ""))] }),
        ]
    }));

    const table = new Table({
        rows: [headerRow, ...rows],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
            left: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
            right: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.accent },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.accent },
        }
    });

    generator.sections.push(table);
    generator.sections.push(new Paragraph({ text: "" })); // Spacing
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderEcosystemConfigurations(generator: ReportGeneratorDOCX, configurations: any[]) {
    if (!configurations || configurations.length === 0) return;

    generator.addSubHeader("Ecosystem Configurations (Assemblages)");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurations.forEach((config: any, index: number) => {
        generator.addText(`${index + 1}. ${config.name}`, STYLE.colors.primary, 0, true);
        if (config.description) {
            generator.addText(config.description, STYLE.colors.subtle, 1);
        }

        if (config.properties) {
            generator.addText(`Stability: ${config.properties.stability || 'N/A'}`, undefined, 1);
            generator.addText(`Generativity: ${config.properties.generativity || 'N/A'}`, undefined, 1);
            if (config.properties.territorialization_score !== undefined) {
                generator.addText(`Territorialization: ${config.properties.territorialization_score}/10`, undefined, 1);
            }
            if (config.properties.coding_intensity_score !== undefined) {
                generator.addText(`Coding Intensity: ${config.properties.coding_intensity_score}/10`, undefined, 1);
            }
        }

        if (config.memberIds && config.memberIds.length > 0) {
            generator.addText(`Member Actors: ${config.memberIds.length}`, STYLE.colors.secondary, 1);
        }

        generator.addSpacer();
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderAbsenceAnalysis(generator: ReportGeneratorDOCX, absenceAnalysis: any) {
    generator.addSubHeader("Critique: Absences & Blindspots");
    if (absenceAnalysis.narrative) {
        generator.addText(absenceAnalysis.narrative);
        generator.addSpacer();
    }

    if (absenceAnalysis.missing_voices && absenceAnalysis.missing_voices.length > 0) {
        generator.addText("Missing Voices:", STYLE.colors.secondary, 0, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        absenceAnalysis.missing_voices.forEach((voice: any) => {
            // Check if voice is an object or string
            const text = typeof voice === 'string' ? voice : `${voice.name} (${voice.category}): ${voice.reason}`;
            generator.addText(`• ${text}`);
        });
        generator.addSpacer();
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderAssemblageAnalysis(generator: ReportGeneratorDOCX, assemblage: any) {
    generator.addSubHeader("Assemblage Analysis");

    // Parts (Socio-Technical Components)
    if (assemblage.socio_technical_components) {
        generator.addText("Parts (Socio-Technical Components)", STYLE.colors.secondary, 0, true);
        const { infra, discourse } = assemblage.socio_technical_components;
        if (infra && infra.length > 0) generator.addText(`Infrastructure: ${infra.join(", ")}`);
        if (discourse && discourse.length > 0) generator.addText(`Discourse: ${discourse.join(", ")}`);
        generator.addSpacer();
    }

    // Flow (Policy Mobilities)
    if (assemblage.policy_mobilities) {
        generator.addText("Flow (Policy Mobilities)", STYLE.colors.secondary, 0, true);
        const { origin_concepts, local_mutations } = assemblage.policy_mobilities;
        if (origin_concepts && origin_concepts.length > 0) generator.addText(`Origin Concepts: ${origin_concepts.join(", ")}`);
        if (local_mutations && local_mutations.length > 0) generator.addText(`Local Mutations: ${local_mutations.join(", ")}`);
        generator.addSpacer();
    }

    // Exterior (Relations of Exteriority)
    if (assemblage.relations_of_exteriority) {
        generator.addText("Exterior (Relations of Exteriority)", STYLE.colors.secondary, 0, true);
        const { detachable, embedded, mobility_score } = assemblage.relations_of_exteriority;
        // Check if mobility_score exists before printing
        if (mobility_score) generator.addText(`Mobility Score: ${mobility_score}`);
        if (detachable && detachable.length > 0) generator.addText(`Detachable Relations: ${detachable.join(", ")}`);
        if (embedded && embedded.length > 0) generator.addText(`Embedded Relations: ${embedded.join(", ")}`);
        generator.addSpacer();
    }

    // Stable (Stabilization Mechanisms)
    if (assemblage.stabilization_mechanisms && assemblage.stabilization_mechanisms.length > 0) {
        generator.addText("Stable (Stabilization Mechanisms)", STYLE.colors.secondary, 0, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assemblage.stabilization_mechanisms.forEach((mech: any) => generator.addText(`• ${mech}`));
        generator.addSpacer();
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderScenarios(generator: ReportGeneratorDOCX, scenarios: any) {
    if (!scenarios || Object.keys(scenarios).length === 0) return;

    generator.addSectionHeader("Scenario Analysis", true);
    generator.addText("Hypothetical scenarios testing the resilience and adaptability of the governance assemblage.");
    generator.addSpacer();

    // Scenarios are typically stored as an object with scenario IDs as keys
    Object.entries(scenarios).forEach(([scenarioId, scenarioData]: [string, any]) => {
        if (scenarioData && scenarioData.name) {
            generator.addSubHeader(scenarioData.name);
            if (scenarioData.description) {
                generator.addText(scenarioData.description);
            }
            if (scenarioData.effects) {
                generator.addText("Effects:", STYLE.colors.secondary, 0, true);
                scenarioData.effects.forEach((effect: string) => {
                    generator.addText(`• ${effect}`, undefined, 1);
                });
            }
            generator.addSpacer();
        }
    });
}
