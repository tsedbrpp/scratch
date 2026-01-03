import { MicroFascismRisk } from "@/lib/risk-calculator";

export const MICRO_FASCISM_RISK_SUMMARY_PROMPT_TEMPLATE = `
You are a specialized political risk analyst providing a diagnostic summary for a "Micro-Fascism Risk Index".

CONTEXT:
The system has analyzed a policy document ("{{CONTEXT}}") and computed a risk score of {{RISK_SCORE}}/6.
Level: {{RISK_LEVEL}}

ACTIVE RISK FLAGS:
{{ACTIVE_FLAGS}}

DETAILED FINDINGS:
- Power Hardening: {{POWER_EXPLANATION}}
- Agency Collapse: {{AGENCY_EXPLANATION}}
- Epistemic Narrowing: {{EPISTEMIC_EXPLANATION}}
- Structural Violence: {{STRUCTURAL_EXPLANATION}}
- Temporal Closure: {{TEMPORAL_EXPLANATION}}
- Absence as Control: {{ABSENCE_EXPLANATION}}

TASK:
Write a concise, high-level summary (max 3 sentences) explaining WHY this document received this score.
Focus on the *convergence* of the active factors. Do not list them mechanically; weave them into a diagnostic narrative.
If the score is 0-2, emphasize the effective "Interpretive Governance" features (openness, accountability).
If the score is 5-6, warn sternly about the "Hardening" of control.
`;

export const fillRiskSummaryPrompt = (template: string, context: string, risk: MicroFascismRisk) => {
    const activeFlags = Object.entries(risk.flags)
        .filter(([_, active]) => active)
        .map(([key, _]) => key.replace(/_/g, ' ').toUpperCase());

    return template
        .replace('{{CONTEXT}}', context || 'Unknown Document')
        .replace('{{RISK_SCORE}}', risk.score.toString())
        .replace('{{RISK_LEVEL}}', risk.level)
        .replace('{{ACTIVE_FLAGS}}', activeFlags.length > 0 ? activeFlags.join(', ') : "None (Safe)")
        .replace('{{POWER_EXPLANATION}}', risk.explanations.power || "None")
        .replace('{{AGENCY_EXPLANATION}}', risk.explanations.agency || "None")
        .replace('{{EPISTEMIC_EXPLANATION}}', risk.explanations.epistemic || "None")
        .replace('{{STRUCTURAL_EXPLANATION}}', risk.explanations.structural || "None")
        .replace('{{TEMPORAL_EXPLANATION}}', risk.explanations.temporal || "None")
        .replace('{{ABSENCE_EXPLANATION}}', risk.explanations.absence || "None");
};

// Deprecated: wrapper for backward compatibility if needed, but we will update usage.
export const generateRiskSummaryPrompt = (context: string, risk: MicroFascismRisk) => {
    return fillRiskSummaryPrompt(MICRO_FASCISM_RISK_SUMMARY_PROMPT_TEMPLATE, context, risk);
};
