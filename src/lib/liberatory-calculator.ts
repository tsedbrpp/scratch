import { AnalysisResult } from "@/types";

export interface LiberatoryCapacity {
    score: number; // 0-8
    level: "Rhetorical/Fragile" | "Partial/Conditional" | "Structural/Robust";
    signals: {
        power_reversibility: boolean;
        agency_protection: boolean;
        epistemic_plurality: boolean;
        exit_rights: boolean;
        repair_recognition: boolean;
        temporal_openness: boolean;
        proportionality: boolean;
        contestable_safety: boolean;
    };
    explanations: {
        power: string;
        agency: string;
        epistemic: string;
        exit: string;
        repair: string;
        temporal: string;
        proportionality: string;
        safety: string;
    };
}

export function calculateLiberatoryCapacity(analysis: AnalysisResult): LiberatoryCapacity {
    const signals = {
        power_reversibility: false,
        agency_protection: false,
        epistemic_plurality: false,
        exit_rights: false,
        repair_recognition: false,
        temporal_openness: false,
        proportionality: false,
        contestable_safety: false
    };

    const explanations = {
        power: "",
        agency: "",
        epistemic: "",
        exit: "",
        repair: "",
        temporal: "",
        proportionality: "",
        safety: ""
    };

    const scores = analysis.governance_scores || { centralization: 50, rights_focus: 50, coloniality: 50, procedurality: 50 };

    // 1. Power Reversibility
    // Inverse of Centralization/Power Hardening
    if ((scores.centralization || 0) < 40 && (scores.procedurality || 0) < 70) {
        signals.power_reversibility = true;
        explanations.power = "Low centralization allows for decision reversal and contestability.";
    } else {
        explanations.power = "High centralization or rigid procedure limits reversibility.";
    }

    // 2. Situated Agency Protection
    // Agency Score check
    // Heuristic: Check if rights_focus is high or if agency text is positive
    const agencyText = analysis.agency_codesign_self_determination || "";
    if ((scores.rights_focus || 0) > 65 || agencyText.toLowerCase().includes("co-design")) {
        signals.agency_protection = true;
        explanations.agency = "Strong focus on rights or co-design protects human agency.";
    } else {
        explanations.agency = "Agency protections appear weak or undefined.";
    }

    // 3. Epistemic Plurality
    // Coloniality Score < 40 + Silence < 2
    const silenceCount = analysis.silenced_voices?.length || 0;
    if ((scores.coloniality || 0) < 45 && silenceCount < 2) {
        signals.epistemic_plurality = true;
        explanations.epistemic = "Low coloniality metric suggests openness to diverse knowledge systems.";
    } else {
        explanations.epistemic = "Epistemic closure detected (Coloniality > 45 or Silenced Voices).";
    }

    // 4. Exit, Pause, or Refusal Rights
    // Check rights pillar or keywords
    const rightsText = analysis.structural_pillars?.rights?.description || "";
    if (rightsText.toLowerCase().includes("refusal") || rightsText.toLowerCase().includes("opt-out") || (scores.rights_focus || 0) > 75) {
        signals.exit_rights = true;
        explanations.exit = "Explicit mention of refusal/opt-out or very high rights score.";
    } else {
        explanations.exit = "No structural guarantee of exit or refusal found.";
    }

    // 5. Recognition of Repair & Care Work
    // Keyword check in Temporal or Cultural analysis
    const temporalEvidence = analysis.temporal_orientation?.evidence || "";
    const framingText = analysis.technology_role || "";
    const hasCareKeywords = /repair|care|maintenance|stewardship|healing/i.test(temporalEvidence + framingText);

    if (hasCareKeywords || analysis.temporal_orientation?.framing === "Care") {
        signals.repair_recognition = true;
        explanations.repair = "Explicit recognition of maintenance, care, or stewardship.";
    } else {
        explanations.repair = "Focus is on innovation/deployment, obscuring maintenance labor.";
    }

    // 6. Temporal Openness
    if (analysis.temporal_orientation && analysis.temporal_orientation.score > 60) {
        signals.temporal_openness = true;
        explanations.temporal = "Future framed as open/iterative, not determined/urgent.";
    } else {
        explanations.temporal = "Future framed as closed, urgent, or inevitable.";
    }

    // 7. Capacity-Sensitive Proportionality
    // Economic analysis check
    if (analysis.economic_burden?.burden_bearer === "Developer" || analysis.economic_burden?.burden_bearer === "State") {
        // If burden is on powerful actors, likely proportional
        signals.proportionality = true;
        explanations.proportionality = `Burden placed on ${analysis.economic_burden.burden_bearer}, protecting vulnerable capacity.`;
    } else if (analysis.economic_burden?.burden_bearer === "Individual") {
        explanations.proportionality = "Burden shifts to individuals, ignoring capacity constraints.";
    } else {
        explanations.proportionality = "Unclear distribution of burden relative to capacity.";
    }

    // 8. Contestable Safety Framing
    // Safety not used as "state of exception"
    // Heuristic: If legitimacy is NOT purely "Technocratic" AND Temporal is NOT "Urgency"
    const legitimacySource = analysis.legitimacy_claims?.source || "";
    const isUrgency = analysis.temporal_orientation?.framing === "Urgency";

    if (!legitimacySource.includes("Technocratic") && !isUrgency) {
        signals.contestable_safety = true;
        explanations.safety = "Safety framed within democratic/rights context, not existential emergency.";
    } else {
        explanations.safety = "Safety may be used to bypass contestability (Technocratic/Urgency).";
    }

    // Composite Score
    const score = Object.values(signals).filter(s => s).length;
    let level: LiberatoryCapacity["level"] = "Rhetorical/Fragile";
    if (score >= 6) level = "Structural/Robust";
    else if (score >= 3) level = "Partial/Conditional";

    return {
        score,
        level,
        signals,
        explanations
    };
}
