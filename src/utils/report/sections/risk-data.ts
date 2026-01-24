import { Source } from "@/types";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";
import { calculateMicroFascismRisk, MicroFascismRisk } from "@/lib/risk-calculator";
import { calculateLiberatoryCapacity, LiberatoryCapacity } from "@/lib/liberatory-calculator";

export function renderDataPageCalculations(generator: ReportGeneratorDOCX, source: Source) {
    if (!source.analysis) return;

    // 0. Decision Ownership & Accountability - Narrative First
    if (source.analysis.accountability_map) {
        generator.addSubHeader("Decision Ownership & Accountability");
        const acc = source.analysis.accountability_map;

        // Build interpretive narrative
        const hasFullAccountability = acc.signatory && acc.liability_holder && acc.appeals_mechanism;
        const narrative = hasFullAccountability
            ? `Accountability chains are formalized through explicit designation of ${acc.signatory} as signatory authority, with liability assigned to ${acc.liability_holder}. Appeals mechanisms (${acc.appeals_mechanism}) provide contestation pathways, suggesting robust procedural accountability architecture.`
            : `Accountability structures exhibit gaps or ambiguities. ${acc.signatory ? `While ${acc.signatory} serves as formal signatory, ` : 'Signatory authority remains unspecified, and '}${acc.liability_holder ? `liability rests with ${acc.liability_holder}, ` : 'liability assignment is unclear, '}creating potential enforcement weaknesses.`;

        generator.addText(narrative);
        generator.addSpacer();

        // Supporting details (subtle)
        if (acc.human_in_the_loop !== undefined) {
            generator.addText(`  → Human oversight: ${acc.human_in_the_loop ? 'Required' : 'Not mandated'}`, STYLE.colors.subtle, 1);
        }
    }

    // Calculate risk and capacity first as they are used in multiple sections
    const risk = calculateMicroFascismRisk(source.analysis);
    const capacity = calculateLiberatoryCapacity(source.analysis);

    // 1. Authoritarian Tendencies - Interpretive Narrative
    if (risk) {
        generator.addSubHeader("Authoritarian Tendencies Analysis");

        // Lead with rich interpretation
        const narrative = interpretRiskNarrative(risk);
        generator.addText(narrative);
        generator.addSpacer();

        // Evidence from observed indicators
        const triggeredFlags = Object.entries(risk.flags)
            .filter(([_, val]) => val)
            .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

        if (triggeredFlags.length > 0) {
            generator.addText("Observed Indicators:", STYLE.colors.secondary, 0, true);
            triggeredFlags.forEach(flag => {
                generator.addText(`  → ${flag}`, undefined, 1);
            });
            generator.addSpacer();
        }

        // Score goes to parenthetical reference
        generator.addText(`(Parametric summary: ${risk.score}/6 ${risk.level} - see methodological appendix)`, STYLE.colors.meta, 0, false);
        generator.addSpacer();
    }

    // 2. Liberatory Capacity - Interpretive Narrative
    if (capacity) {
        generator.addSubHeader("Liberatory Capacity Assessment");

        // Lead with interpretation
        const narrative = interpretCapacityNarrative(capacity);
        generator.addText(narrative);
        generator.addSpacer();

        // Evidence from active signals
        const triggeredSignals = Object.entries(capacity.signals)
            .filter(([_, val]) => val)
            .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

        if (triggeredSignals.length > 0) {
            generator.addText("Enabling Conditions:", STYLE.colors.secondary, 0, true);
            triggeredSignals.forEach(signal => {
                generator.addText(`  → ${signal}`, undefined, 1);
            });
            generator.addSpacer();
        }

        // Score parenthetical
        generator.addText(`(Parametric summary: ${capacity.score}/8 ${capacity.level})`, STYLE.colors.meta, 0, false);
        generator.addSpacer();
    }

    // 3. Verification Gap - Narrative First
    if (source.analysis.verification_gap) {
        generator.addSubHeader("Rhetorical-Empirical Alignment");
        const gap = source.analysis.verification_gap;

        // Interpretive narrative
        const narrative = gap.high_rhetoric_low_verification
            ? `A significant rhetorical-empirical gap emerges where aspirational language outpaces concrete enforcement mechanisms. ${gap.gap_explanation} This disconnect between text and practice creates space for symbolic compliance while substantive accountability remains elusive.`
            : `Claims are grounded in verifiable mechanisms, creating aligned rhetoric and enforcement. ${gap.gap_explanation} This coherence between stated intentions and operational capacity suggests the assemblage can deliver on its commitments.`;

        generator.addText(narrative);
        generator.addSpacer();
    }

    // 4. Counter-Narrative Stress Test - Narrative First
    if (source.analysis.stress_test_report) {
        generator.addSubHeader("Rhetorical Robustness Assessment");
        const stress = source.analysis.stress_test_report;

        // Lead with interpretive narrative
        const narrative = interpretStressTestNarrative(
            stress.framing_sensitivity,
            stress.original_score,
            stress.perturbed_score
        );
        generator.addText(narrative);
        generator.addSpacer();

        // Supporting evidence - rhetorical shifts
        if (stress.rhetorical_shifts && stress.rhetorical_shifts.length > 0) {
            generator.addText("Key Rhetorical Transformations:", STYLE.colors.secondary, 0, true);
            stress.rhetorical_shifts.forEach(shift => {
                generator.addText(`  → "${shift.original}" reframed as "${shift.new}"`, undefined, 1);
                if (shift.explanation) {
                    generator.addText(`    (${shift.explanation})`, STYLE.colors.subtle, 2);
                }
            });
            generator.addSpacer();
        }

        // Score as parenthetical
        generator.addText(`(Score shift: ${stress.original_score} → ${stress.perturbed_score}, Sensitivity: ${stress.framing_sensitivity})`, STYLE.colors.meta, 0, false);
        generator.addSpacer();
    }

    // 5. System Critique (Blind Spots) - Already narrative-heavy
    if (source.analysis.system_critique) {
        generator.addSubHeader("Reflexive Critique & Epistemological Limits");
        const critique = source.analysis.system_critique;

        if (critique.blind_spots && critique.blind_spots.length > 0) {
            generator.addText("Potential Blind Spots:", STYLE.colors.danger, 0, true);
            critique.blind_spots.forEach(spot => generator.addText(`  → ${spot}`, undefined, 1));
            generator.addSpacer();
        }

        if (critique.legitimacy_correction) {
            generator.addText("Legitimacy Correction:", STYLE.colors.secondary, 0, true);
            generator.addText(critique.legitimacy_correction);
            generator.addSpacer();
        }
    }

    // [NEW] Economic Burden
    if (source.analysis.economic_burden) {
        generator.addSubHeader("Economic Burden Analysis");
        const eb = source.analysis.economic_burden;
        generator.addText(`Burden Bearer: ${eb.burden_bearer}`, STYLE.colors.primary, 0, true);
        generator.addText(`Cost Visibility: ${eb.cost_visibility}`);
        generator.addText(`Market Consolidation Risk: ${eb.market_consolidation_risk}`);
        generator.addText("Explanation:", STYLE.colors.secondary, 0, true);
        generator.addText(eb.explanation);
        generator.addSpacer();
    }

    // [NEW] Verification Pathways
    if (source.analysis.verification_pathways) {
        generator.addSubHeader("Verification Pathways");
        const vp = source.analysis.verification_pathways;
        generator.addText(`Overall Score: ${vp.score}/10`, STYLE.colors.primary, 0, true);
        if (vp.visibility.length > 0) generator.addText(`• Visibility: ${vp.visibility.join(", ")}`);
        if (vp.enforcement.length > 0) generator.addText(`• Enforcement: ${vp.enforcement.join(", ")}`);
        if (vp.exemptions.length > 0) generator.addText(`• Exemptions: ${vp.exemptions.join(", ")}`);
        generator.addSpacer();
    }

    // 6. Canonical Evidence - Narrative context
    if (source.analysis.verified_quotes && source.analysis.verified_quotes.length > 0) {
        generator.addSubHeader("Canonical Evidence");
        generator.addText("The following textual anchors ground the above interpretations:");
        generator.addSpacer();

        source.analysis.verified_quotes.forEach((quote, idx) => {
            generator.addText(`[${idx + 1}] "${quote.text}"`, STYLE.colors.secondary, 0, false);
            generator.addText(`    Context: ${quote.context} (Confidence: ${quote.confidence})`, STYLE.colors.meta, 1);
        });
    }
}

// Helper methods for narrative interpretation
function interpretRiskNarrative(risk: MicroFascismRisk): string {
    if (risk.level === 'Micro-Fascist Hardening') {
        return "The assemblage exhibits pronounced authoritarian characteristics, manifested through exclusionary boundaries, opaque decision-making, and punitive enforcement mechanisms that concentrate power while marginalizing affected communities. These dynamics create conditions for micro-fascist organizing where bureaucratic authority supersedes democratic accountability.";
    } else if (risk.level === 'Directional Drift') {
        return "Moderate authoritarian tendencies emerge in bureaucratic rigidity and limited participatory channels, though countervailing democratic elements provide some accountability. The assemblage oscillates between technocratic efficiency and inclusive governance, creating friction points where power concentrates.";
    } else {
        return "The assemblage demonstrates democratic robustness with distributed authority, transparent procedures, and meaningful participation mechanisms. While not without hierarchies, power relations remain contestable and subject to procedural checks that prevent authoritarian drift.";
    }
}

function interpretCapacityNarrative(capacity: LiberatoryCapacity): string {
    if (capacity.level === 'Structural/Robust') {
        return "The assemblage creates substantive openings for emancipatory practice through collective rights frameworks, participatory governance structures, and explicit recognition of marginalized epistemologies. These enabling conditions support bottom-up organizing and resist neoliberal enclosure of political possibility.";
    } else if (capacity.level === 'Partial/Conditional') {
        return "Liberatory potential exists but remains constrained by institutional inertia and market logics. While formal rights and consultation mechanisms provide some agency, systemic barriers limit transformative capacity. The assemblage offers tactical openings rather than strategic reconfigurations of power.";
    } else {
        return "Limited liberatory capacity emerges within a predominantly technocratic framework that forecloses radical alternatives. Participation channels privilege expert knowledge over lived experience, and accountability mechanisms reinforce existing hierarchies rather than enabling collective self-determination.";
    }
}

function interpretStressTestNarrative(
    sensitivity: 'High' | 'Medium' | 'Low',
    originalScore: number,
    perturbedScore: number
): string {
    const shift = Math.abs(originalScore - perturbedScore);

    if (sensitivity === 'High') {
        return `Critical fragility detected: the assemblage's authority collapses under rhetorical inversion (${shift}-point degradation), revealing dependence on persuasive framing rather than robust structural mechanisms. This brittleness suggests the policy relies more on ideological legitimation than material accountability, making it vulnerable to hostile interpretation or bad-faith implementation.`;
    } else if (sensitivity === 'Medium') {
        return `Moderate rhetorical dependency emerges through adversarial reframing (${shift}-point shift). While the assemblage possesses some structural integrity, hostile actors could exploit framing ambiguities to weaken its authority. This suggests a need for more concrete enforcement mechanisms to insulate governance from interpretive manipulation.`;
    } else {
        return `Robust structural resilience withstands rhetorical inversion with minimal degradation (${shift}-point variance). The assemblage's authority derives from concrete mechanisms and specific mandates rather than aspirational language, enabling it to resist hostile spin and maintain operational coherence across varied interpretive contexts.`;
    }
}
