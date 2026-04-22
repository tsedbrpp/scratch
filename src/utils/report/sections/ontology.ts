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

        // Ghost Node Assessment Audit
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ghostNodes = (map.nodes || []).filter((n: any) => n.isGhost);
        if (ghostNodes.length > 0) {
            renderGhostNodeAssessmentAudit(generator, ghostNodes);
        }
    });
}

const CRITERION_LABELS: Record<string, string> = {
    functionalRelevance: 'Functional Relevance',
    textualTrace: 'Textual Trace',
    structuralForeclosure: 'Structural Foreclosure',
};

const STATUS_LABELS: Record<string, string> = {
    proposed: 'Unassessed',
    confirmed: 'Confirmed',
    contested: 'Contested',
    deferred: 'Deferred',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderGhostNodeAssessmentAudit(generator: ReportGeneratorDOCX, ghostNodes: any[]) {
    generator.addSubHeader("Ghost Node Assessment Audit");
    generator.addText(
        "The following records document the analyst's reflexive assessment of each AI-detected Ghost Node against the three evidentiary criteria (§4.2). " +
        "Each entry logs the assessment verdict (confirmed, contested, or deferred), per-criterion judgments, any contest reason, and the analyst's reflexive note.",
        STYLE.colors.meta
    );
    generator.addSpacer();

    // Aggregate counts
    const counts = { confirmed: 0, contested: 0, deferred: 0, proposed: 0 };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ghostNodes.forEach((node: any) => {
        const assessment = node.analystAssessment;
        const status = assessment?.status || 'proposed';
        counts[status as keyof typeof counts]++;

        const statusLabel = STATUS_LABELS[status] || status;
        const statusColor = status === 'confirmed' ? STYLE.colors.success :
            status === 'contested' ? STYLE.colors.danger : STYLE.colors.meta;

        // Node header
        generator.addText(
            `• ${node.label || node.name || 'Unknown'} — ${statusLabel}`,
            statusColor, 0, true
        );

        // Absence type
        if (node.absenceType || node.exclusionType) {
            generator.addText(
                `Absence Type: ${node.absenceType || node.exclusionType}`,
                STYLE.colors.meta, 1
            );
        }

        if (assessment) {
            // Criteria checklist
            if (assessment.criteriaChecklist) {
                const criteriaLine = Object.entries(assessment.criteriaChecklist)
                    .map(([key, value]) => {
                        const label = CRITERION_LABELS[key] || key;
                        return `${label}: ${value === true ? '✓ Met' : value === false ? '✗ Unmet' : '— Unassessed'}`;
                    })
                    .join('  |  ');
                generator.addText(criteriaLine, STYLE.colors.secondary, 1);
            }

            // Contest reason
            if (status === 'contested' && assessment.contestReason) {
                generator.addText(`Contest Reason: ${assessment.contestReason}`, STYLE.colors.danger, 1);
                if (assessment.failedCriterion) {
                    generator.addText(
                        `Failed Criterion: ${CRITERION_LABELS[assessment.failedCriterion] || assessment.failedCriterion}`,
                        STYLE.colors.danger, 1
                    );
                }
            }

            // Reflexive note
            if (assessment.reflexiveNote?.trim()) {
                generator.addText(`Reflexive Note: "${assessment.reflexiveNote}"`, STYLE.colors.subtle, 1);
            }

            // Timestamp
            if (assessment.assessedAt) {
                const date = new Date(assessment.assessedAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                });
                generator.addText(`Assessed: ${date}`, STYLE.colors.meta, 1);
            }

            // Provenance chain (P3)
            if (assessment.assessmentHistory && assessment.assessmentHistory.length > 0) {
                generator.addText(`Provenance Chain (${assessment.assessmentHistory.length} entries):`, STYLE.colors.meta, 1, true);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                assessment.assessmentHistory.forEach((entry: any, i: number) => {
                    const actionLabels: Record<string, string> = {
                        initial: 'Initial', revision: 'Revised', contest: 'Contested',
                        confirm: 'Confirmed', defer: 'Deferred',
                    };
                    const criteriaStr = [
                        `FR:${entry.criteriaChecklist?.functionalRelevance === true ? '✓' : entry.criteriaChecklist?.functionalRelevance === false ? '✗' : '—'}`,
                        `TT:${entry.criteriaChecklist?.textualTrace === true ? '✓' : entry.criteriaChecklist?.textualTrace === false ? '✗' : '—'}`,
                        `SF:${entry.criteriaChecklist?.structuralForeclosure === true ? '✓' : entry.criteriaChecklist?.structuralForeclosure === false ? '✗' : '—'}`,
                    ].join(' ');
                    const ts = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    }) : '';
                    const assessor = entry.assessorId ? ` [${entry.assessorId.slice(0, 8)}]` : '';
                    generator.addText(
                        `• ${i + 1}. ${actionLabels[entry.action] || entry.action} — ${criteriaStr} — ${ts}${assessor}`,
                        STYLE.colors.meta, 2
                    );
                });

                // Multi-analyst summary (P4)
                const assessors = new Map<string, string>();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                assessment.assessmentHistory.forEach((e: any) => {
                    if (e.assessorId) assessors.set(e.assessorId, e.status);
                });
                if (assessors.size > 1) {
                    const verdicts = [...assessors.values()];
                    const allAgree = verdicts.every((v: string) => v === verdicts[0]);
                    generator.addText(
                        allAgree
                            ? `Inter-analyst agreement: ${assessors.size} analysts concur — ${verdicts[0]}`
                            : `⚠ Inter-analyst disagreement: ${[...assessors.entries()].map(([id, v]) => `${id.slice(0, 8)}: ${v}`).join(', ')}`,
                        allAgree ? STYLE.colors.success : STYLE.colors.danger, 2
                    );
                }
            }
        } else {
            generator.addText("No analyst assessment recorded.", STYLE.colors.meta, 1);
        }
    });

    // Aggregate summary
    generator.addSpacer();
    generator.addText("Assessment Summary:", STYLE.colors.secondary, 0, true);
    const total = ghostNodes.length;
    const assessed = counts.confirmed + counts.contested + counts.deferred;
    generator.addText(
        `${total} Ghost Nodes detected | ${assessed} assessed (${Math.round((assessed / total) * 100)}%) | ` +
        `${counts.confirmed} confirmed | ${counts.contested} contested | ${counts.deferred} deferred | ${counts.proposed} unassessed`,
        STYLE.colors.text
    );
    generator.addSpacer();
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
