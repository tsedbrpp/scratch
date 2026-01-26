import { AnalysisResult } from "@/types";

export interface MicroFascismRisk {
    score: number; // 0-6
    level: "Interpretive" | "Directional Drift" | "Micro-Fascist Hardening";
    flags: {
        power_hardening: boolean;
        agency_collapse: boolean;
        epistemic_narrowing: boolean;
        structural_violence: boolean;
        temporal_closure: boolean;
        absence_as_control: boolean;
    };
    explanations: {
        power: string;
        agency: string;
        epistemic: string;
        structural: string;
        temporal: string;
        absence: string;
    };
}

export function calculateMicroFascismRisk(analysis: AnalysisResult): MicroFascismRisk {
    const flags = {
        power_hardening: false,
        agency_collapse: false,
        epistemic_narrowing: false,
        structural_violence: false,
        temporal_closure: false,
        absence_as_control: false
    };

    const explanations = {
        power: "",
        agency: "",
        epistemic: "",
        structural: "",
        temporal: "",
        absence: ""
    };

    const scores = analysis.governance_scores || { centralization: 50, procedurality: 50, market_power: 50, rights_focus: 50, flexibility: 50 };

    // 1. Power Hardening
    // Authority collapse into procedure or high centralization
    if ((scores.centralization || 0) > 75) {
        flags.power_hardening = true;
        explanations.power = `Centralization score (${scores.centralization}) exceeds critical threshold.`;
    } else if ((scores.procedurality || 0) > 85) {
        flags.power_hardening = true;
        explanations.power = `Procedurality score (${scores.procedurality}) indicates automated bureaucracy.`;
    }

    // 2. Agency Collapse
    // Agency reframed as liability
    const agencyScore = parseInt(analysis.agency_codesign_self_determination?.match(/(\d+)/)?.[1] || "50"); // Heuristic if not numeric field, but usually implicit
    // Actually we don't have a raw score for agency in governance_scores, so we infer from rights_focus or add it.
    // Let's use Rights Focus < 40 as proxy if explicit agency score missing, OR if we parse it from text.
    // Better: Use `rights_focus` context.
    if ((scores.rights_focus || 0) < 35) {
        flags.agency_collapse = true;
        explanations.agency = `Rights Focus (${scores.rights_focus}) is critically low, suggesting user liability.`;
    }

    // 3. Epistemic Narrowing
    // Knowledge standardization
    // Use Plurality/Inclusion text analysis or Coloniality Score
    if ((scores.coloniality || 0) > 60) {
        flags.epistemic_narrowing = true;
        explanations.epistemic = `Coloniality score (${scores.coloniality}) indicates domination of a single worldview.`;
    } else if (analysis.silenced_voices && analysis.silenced_voices.length > 3) {
        flags.epistemic_narrowing = true;
        explanations.epistemic = `High number of silenced voices (${analysis.silenced_voices.length}) detected.`;
    }

    // 4. Structural Violence
    // Material Consequences
    if (analysis.economic_burden) {
        if (analysis.economic_burden.market_consolidation_risk === "High") {
            flags.structural_violence = true;
            explanations.structural = "High risk of market consolidation detected.";
        } else if (analysis.economic_burden.burden_bearer === "Individual" || analysis.economic_burden.burden_bearer === "Society") {
            flags.structural_violence = true;
            explanations.structural = `Economic burden shifted to ${analysis.economic_burden.burden_bearer}.`;
        }
    }

    // 5. Temporal Closure
    // Teleology
    if (analysis.temporal_orientation && typeof analysis.temporal_orientation === 'object') {
        const temporal = analysis.temporal_orientation as any; // Fallback to any to avoid property access errors on complex unions
        if (temporal.score < 35) {
            flags.temporal_closure = true;
            explanations.temporal = `Temporal Openness score (${temporal.score}) indicates 'Desinty' or 'Urgency' framing.`;
        } else if (temporal.framing === "Urgency" || temporal.framing === "Destiny") {
            flags.temporal_closure = true;
            explanations.temporal = `Future framed as '${temporal.framing}', closing off alternatives.`;
        }
    }

    // 6. Absence as Control
    // No exit rights, invisible labor
    // We check system critique blind spots
    const blindSpots = analysis.system_critique?.blind_spots?.length || 0;
    if (blindSpots > 4) {
        flags.absence_as_control = true;
        explanations.absence = `Critical mass of blind spots (${blindSpots}) indicates governance by omission.`;
    }

    // Calculate Composite
    const score = Object.values(flags).filter(f => f).length;
    let level: MicroFascismRisk["level"] = "Interpretive";
    if (score >= 5) level = "Micro-Fascist Hardening";
    else if (score >= 3) level = "Directional Drift";

    return {
        score,
        level,
        flags,
        explanations
    };
}
