import { LiberatoryCapacity } from "@/lib/liberatory-calculator";

export const LIBERATORY_CAPACITY_SUMMARY_PROMPT_TEMPLATE = `
You are a governance systems analyst producing an executive diagnostic summary for a Liberatory Governance Capacity Index (LGCI).

CONTEXT
A policy document (“{{CONTEXT}}”) has been analyzed for its capacity to preserve openness, plurality, reversibility, and situated judgment within an AI governance assemblage.

Liberatory Capacity Score: {{LIBERATION_SCORE}} / 8
Capacity Level: {{LIBERATION_LEVEL}}

Activated Liberatory Signals:
{{ACTIVE_COUNTER_INDICATORS}}

ANALYTIC DIMENSIONS
The following liberatory governance properties were assessed:

Power Reversibility: {{POWER_REVERSIBILITY_EXPLANATION}}
Situated Agency Protection: {{AGENCY_PROTECTION_EXPLANATION}}
Epistemic Plurality: {{EPISTEMIC_PLURALITY_EXPLANATION}}
Exit, Pause, or Refusal Rights: {{EXIT_RIGHTS_EXPLANATION}}
Recognition of Repair & Care Work: {{REPAIR_RECOGNITION_EXPLANATION}}
Temporal Openness: {{TEMPORAL_OPENNESS_EXPLANATION}}
Capacity-Sensitive Proportionality: {{CAPACITY_SENSITIVITY_EXPLANATION}}
Contestable Safety Framing: {{SAFETY_CONTESTABILITY_EXPLANATION}}

TASK
Write a concise, high-level diagnostic narrative (maximum 3 sentences) explaining how this document sustains or fails to sustain liberatory governance capacity.

Guidelines:
Focus on the interaction and reinforcement of liberatory features, not isolated safeguards.
Emphasize whether openness is structural (designed into procedures) or merely symbolic.
Describe the direction of governance the document enables (iterative, plural, reversible vs brittle, exceptional, or conditional).

Tone by Score:
Score 0–2: Note the absence or fragility of liberatory design; openness is rhetorical or easily overridden.
Score 3–5: Highlight partial safeguards and points of leverage, alongside conditions under which they may erode.
Score 6–8: Emphasize robust design features that actively preserve contestability, exit, and learning under pressure.

Do not praise intentions, speculate about political motives, or propose reforms.
Your role is diagnostic and descriptive, not normative.
`;

export const fillLiberatoryPrompt = (template: string, context: string, capacity: LiberatoryCapacity) => {
    const activeSignals = Object.entries(capacity.signals)
        .filter(([_, active]) => active)
        .map(([key, _]) => key.replace(/_/g, ' ').toUpperCase());

    return template
        .replace('{{CONTEXT}}', context || 'Unknown Document')
        .replace('{{LIBERATION_SCORE}}', capacity.score.toString())
        .replace('{{LIBERATION_LEVEL}}', capacity.level)
        .replace('{{ACTIVE_COUNTER_INDICATORS}}', activeSignals.length > 0 ? activeSignals.join(', ') : "None (Fragile)")
        .replace('{{POWER_REVERSIBILITY_EXPLANATION}}', capacity.explanations.power || "N/A")
        .replace('{{AGENCY_PROTECTION_EXPLANATION}}', capacity.explanations.agency || "N/A")
        .replace('{{EPISTEMIC_PLURALITY_EXPLANATION}}', capacity.explanations.epistemic || "N/A")
        .replace('{{EXIT_RIGHTS_EXPLANATION}}', capacity.explanations.exit || "N/A")
        .replace('{{REPAIR_RECOGNITION_EXPLANATION}}', capacity.explanations.repair || "N/A")
        .replace('{{TEMPORAL_OPENNESS_EXPLANATION}}', capacity.explanations.temporal || "N/A")
        .replace('{{CAPACITY_SENSITIVITY_EXPLANATION}}', capacity.explanations.proportionality || "N/A")
        .replace('{{SAFETY_CONTESTABILITY_EXPLANATION}}', capacity.explanations.safety || "N/A");
};
