import { ReportData } from "@/types/report";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

export function renderOntology(generator: ReportGeneratorDOCX, data: ReportData["ontology"]) {
    if (!data) return;
    generator.addSectionHeader("Ontological Cartography", true);

    const maps = Object.values(data.maps);
    if (maps.length === 0) {
        generator.addText("No ontological maps generated.");
    } else {
        renderOntologyMaps(generator, maps);
    }

    if (data.comparison) {
        renderOntologyComparison(generator, data.comparison);
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderOntologyMaps(generator: ReportGeneratorDOCX, maps: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    maps.forEach((map: any, idx) => {
        generator.addSubHeader(`Map Analysis ${idx + 1}`);
        if (map.summary) generator.addText(map.summary);

        // Nodes
        if (map.nodes && map.nodes.length > 0) {
            generator.addText("Key Concepts (Nodes):", STYLE.colors.secondary, 0, true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map.nodes.forEach((node: any) => {
                generator.addText(`• ${node.label} [${node.category}]`, STYLE.colors.primary, 0, true);
                if (node.description) generator.addText(node.description);
                if (node.quote) generator.addText(`"${node.quote}"`, STYLE.colors.subtle, 1);
            });
            generator.addSpacer();
        }

        // Links
        if (map.links && map.links.length > 0) {
            generator.addText("Network Topology (Relations):", STYLE.colors.secondary, 0, true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const relations = map.links.map((l: any) => {
                // Find node labels if possible, else use IDs
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sourceNode = map.nodes.find((n: any) => n.id === l.source)?.label || l.source;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const targetNode = map.nodes.find((n: any) => n.id === l.target)?.label || l.target;
                return `${sourceNode} --[${l.relation}]--> ${targetNode}`;
            });
            relations.slice(0, 15).forEach((r: string) => generator.addText(`• ${r}`)); // Limit to top 15 to avoid spam
            if (relations.length > 15) generator.addText(`...and ${relations.length - 15} more relations.`);
            generator.addSpacer();
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderOntologyComparison(generator: ReportGeneratorDOCX, comp: any) {
    generator.addSubHeader("Comparative Ontology");
    if (comp.summary) generator.addText(comp.summary);

    // Metrics
    if (comp.assemblage_metrics && comp.assemblage_metrics.length > 0) {
        generator.addText("Assemblage Metrics:", STYLE.colors.secondary, 0, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        comp.assemblage_metrics.forEach((m: any) => {
            generator.addText(`${m.jurisdiction}:`, STYLE.colors.primary, 0, true);
            generator.addText(`• Territorialization: ${m.territorialization}/100 - ${m.territorialization_justification}`);
            generator.addText(`• Coding: ${m.coding}/100 - ${m.coding_justification}`);
        });
        generator.addSpacer();
    }

    // Differences
    generator.addText("Structural Differences:", STYLE.colors.secondary, 0, true);
    generator.addText(comp.structural_differences);
    generator.addSpacer();

    if (comp.shared_concepts && comp.shared_concepts.length > 0) {
        generator.addText(`Shared Concepts: ${comp.shared_concepts.join(", ")}`);
    }

    if (comp.relationship_divergences && comp.relationship_divergences.length > 0) {
        generator.addText("Relationship Divergences:", STYLE.colors.secondary, 0, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        comp.relationship_divergences.forEach((d: any) => {
            generator.addText(`• ${d.concept}: ${d.difference}`);
        });
    }
}
