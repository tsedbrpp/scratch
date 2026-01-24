import { ComparativeSynthesis } from "@/types";
import { ReportData } from "@/types/report";
import { SynthesisComparisonResult } from "@/types/synthesis";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

export function renderCrossCaseSynthesis(generator: ReportGeneratorDOCX, data: ReportData["synthesis"]) {
    if (!data || !data.comparison) return;
    generator.addSectionHeader("Cross-Case Synthesis", true);

    const comp = data.comparison as unknown as (ComparativeSynthesis & SynthesisComparisonResult);

    // Synthesis Summary (Relational Summary)
    if (comp.synthesis_summary) {
        generator.addSubHeader("Relational Summary");
        generator.addText(comp.synthesis_summary);
        generator.addSpacer();
    }

    // Executive Matrix
    renderSynthesisMatrix(generator, comp);

    // Concept Mutations (Policy Mobilities)
    if (comp.concept_mutations && comp.concept_mutations.length > 0) {
        generator.addSubHeader("Policy Mobilities & Concept Mutations");
        generator.addText("How concepts travel and mutate across jurisdictions:");
        generator.addSpacer();

        comp.concept_mutations.forEach((mutation) => {
            generator.addText(`• ${mutation.concept}`, STYLE.colors.primary, 0, true);
            generator.addText(`Origin: ${mutation.origin_context}`, undefined, 1);

            if (mutation.local_mutations && Array.isArray(mutation.local_mutations)) {
                mutation.local_mutations.forEach(lm => {
                    generator.addText(`Local Mutation (${lm.policy}): ${lm.mutation}`, undefined, 1);
                    generator.addText(`Mechanism: ${lm.mechanism}`, STYLE.colors.subtle, 1);
                });
            }
            generator.addSpacer();
        });
    }

    // Stabilization Mechanisms
    if (comp.stabilization_mechanisms && comp.stabilization_mechanisms.length > 0) {
        generator.addSubHeader("Stabilization Mechanisms");
        generator.addText("How assemblages maintain coherence across territorial boundaries:");
        generator.addSpacer();

        comp.stabilization_mechanisms.forEach((mech) => {
            generator.addText(`• [${mech.type}] ${mech.jurisdiction}`, STYLE.colors.secondary, 0, true);
            generator.addText(mech.mechanism, undefined, 1);
        });
        generator.addSpacer();
    }

    // Desire and Friction
    if (comp.desire_and_friction && comp.desire_and_friction.length > 0) {
        generator.addSubHeader("Desire & Friction Points");
        generator.addText("Tensions between policy aspirations and structural constraints:");
        generator.addSpacer();

        comp.desire_and_friction.forEach((item) => {
            generator.addText(`${item.topic}`, STYLE.colors.primary, 0, true);
            generator.addText(`Friction: ${item.friction_point}`, undefined, 1);
            generator.addText(`Underlying Desire: ${item.underlying_desire}`, STYLE.colors.secondary, 1);
            generator.addSpacer();
        });
    }

    // Institutional Conflicts
    if (comp.institutional_conflict && comp.institutional_conflict.length > 0) {
        generator.addSubHeader("Institutional Conflicts");
        comp.institutional_conflict.forEach((conf) => {
            generator.addText(conf.conflict_type, STYLE.colors.primary, 0, true);
            generator.addText(conf.description, undefined, 1);
            if (conf.evidence && Array.isArray(conf.evidence)) {
                conf.evidence.forEach(ev => {
                    generator.addText(`${ev.policy} Evidence: "${ev.text}"`, STYLE.colors.subtle, 1);
                });
            }
            generator.addSpacer();
        });
    }

    // Legitimacy Tensions
    if (comp.legitimacy_tensions && comp.legitimacy_tensions.length > 0) {
        generator.addSubHeader("Legitimacy Tensions");
        comp.legitimacy_tensions.forEach((tens) => {
            generator.addText(tens.tension_type, STYLE.colors.primary, 0, true);
            generator.addText(tens.description, undefined, 1);
            if (tens.evidence && Array.isArray(tens.evidence)) {
                tens.evidence.forEach(ev => {
                    generator.addText(`${ev.policy} Evidence: "${ev.text}"`, STYLE.colors.subtle, 1);
                });
            }
            generator.addSpacer();
        });
    }

    // Coloniality Assessment
    if (comp.coloniality_assessment) {
        generator.addSubHeader("Coloniality Assessment");
        generator.addText(comp.coloniality_assessment);
        generator.addSpacer();
    }

    // System Critique
    if (comp.system_critique) renderSynthesisCritique(generator, comp.system_critique);

    // Verified Quotes
    if (comp.verified_quotes && comp.verified_quotes.length > 0) renderVerifiedQuotes(generator, comp.verified_quotes);

    // Ecosystem Impacts (Sankey Data)
    if (data.ecosystemImpacts && data.ecosystemImpacts.length > 0) renderEcosystemImpacts(generator, data.ecosystemImpacts);

    // Assemblage Rhizome Network
    if (comp.assemblage_network) renderAssemblageRhizome(generator, comp.assemblage_network);
}

function renderSynthesisMatrix(generator: ReportGeneratorDOCX, comp: SynthesisComparisonResult) {
    generator.addSubHeader("Synthesis Framework Matrix");

    ['Risk', 'Governance', 'Rights', 'Scope'].forEach(dim => {
        const key = dim.toLowerCase() as keyof typeof comp;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = comp[key] as any; // Type assertion since structure is uniform
        if (val) {
            generator.addText(`${dim} Dimension:`, STYLE.colors.primary, 0, true);
            generator.addText(`• Convergence: ${val.convergence}`);
            generator.addText(`• Divergence: ${val.divergence}`);
            generator.addText(`• Coloniality: ${val.coloniality}`);
            generator.addText(""); // Separator
        }
    });
}

function renderSynthesisCritique(generator: ReportGeneratorDOCX, crit: NonNullable<SynthesisComparisonResult['system_critique']>) {
    generator.addSubHeader("System-Level Critique");
    if (typeof crit === 'string') {
        generator.addText(crit);
    } else {
        if (crit.blind_spots) {
            generator.addText("Blind Spots:", STYLE.colors.secondary, 0, true);
            crit.blind_spots.forEach((Spot: string) => generator.addText(`• ${Spot}`));
        }
        if (crit.legitimacy_correction) {
            generator.addText("Legitimacy Correction:", STYLE.colors.secondary, 0, true);
            generator.addText(crit.legitimacy_correction);
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderVerifiedQuotes(generator: ReportGeneratorDOCX, quotes: any[]) {
    generator.addSubHeader("Verified Canonical Evidence");
    quotes.forEach(quote => {
        generator.addText(`"${quote.text}"`, STYLE.colors.secondary, 0, false);
        generator.addText(`(Source: ${quote.source} | Relevance: ${quote.relevance})`, STYLE.colors.meta, 1);
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderEcosystemImpacts(generator: ReportGeneratorDOCX, impacts: any[]) {
    generator.addSubHeader("Ecosystem Impact Mapping");
    generator.addText("Mapping of policy mechanisms to ecosystem actors.", STYLE.colors.meta);

    impacts.forEach(impact => {
        generator.addText(`${impact.actor}`, STYLE.colors.primary, 0, true);
        generator.addText(`• Mechanism: ${impact.mechanism}`);
        generator.addText(`• Impact: ${impact.impact} (${impact.type})`);
        if (impact.interconnection_type) {
            generator.addText(`• Connection: ${impact.interconnection_type}`, STYLE.colors.meta);
        }
        generator.addSpacer();
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderAssemblageRhizome(generator: ReportGeneratorDOCX, network: any) {
    if (!network || !network.nodes || network.nodes.length === 0) return;

    generator.addSubHeader("Assemblage Rhizome (Policy Network)");
    generator.addText("Mapping shared ancestry and inter-referential citations across policy documents.");
    generator.addSpacer();

    // Nodes
    generator.addText("Network Nodes:", STYLE.colors.secondary, 0, true);
    network.nodes.forEach((node: string) => {
        generator.addText(`• ${node}`, undefined, 1);
    });
    generator.addSpacer();

    // Edges (Relationships)
    if (network.edges && network.edges.length > 0) {
        generator.addText("Network Relationships:", STYLE.colors.secondary, 0, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        network.edges.forEach((edge: any) => {
            generator.addText(`• ${edge.from} → ${edge.to} (${edge.type})`, undefined, 1);
        });
        generator.addSpacer();
    }

    generator.addText("Note: Visual network diagram available in the web interface.", STYLE.colors.subtle, 0, false);
}
