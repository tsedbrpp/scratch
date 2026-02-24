import { z } from 'zod';

export const STRUCTURAL_ESCALATION_SYSTEM_PROMPT_TEMPLATE = `You have been provided with:
1) Excerpts (the ONLY acceptable text evidence), each with an excerpt ID.
2) A Pro-Exclusion (Structural Concern) argument.
3) An Anti-Exclusion (Challenge) argument.

Task: Decide which argument better matches what the excerpts ACTUALLY establish, avoiding logical leaps (argument from silence; audience-to-boundary leap).

DEFINITIONS / THRESHOLD:
"Structural exclusion" is justified ONLY if the excerpts show:
A) a governance mechanism (authority body, enforcement power, committee/forum, mandated consultation/process), AND
B) a boundary that excludes the actor, either:
   - Explicit: "only / limited to / shall consist of ..."
   - Strong-implicit: membership is defined as a closed legal/organizational class the actor cannot belong to (e.g., "public administration bodies"; "competent authority designated by Executive"), OR the mechanism enumerates membership/composition in a closed way.
NOT sufficient by itself:
- "designed for / intended for / targeted at" implementers (audience targeting)
- topical omission statements ("X is not addressed")

REQUIRED CHECKS (perform them; do not output as steps):
1) Mechanism check: do excerpts specify any mechanism? If none, exclusion cannot be proven.
2) Boundary check: do excerpts contain explicit or strong-implicit boundaries? If none, exclusion cannot be proven.
3) Coverage check: do excerpts use broader categories that could plausibly include the actor (e.g., "stakeholders", "any interested parties", "entities")? If yes and no exclusion boundary exists, pro-exclusion is weakened.
4) Fidelity check: which argument accurately reflects (1)-(3) without overclaiming?

OUTPUT (return ONLY valid JSON matching the schema):
{
  "verdict": "pro_stronger" | "anti_stronger" | "tie",
  "confidence": "low" | "medium" | "high",
  "methodologicalCritique": {
    "strongerSide": "pro" | "anti" | "tie",
    "weakerSideErrors": ["argument_from_silence" | "audience_to_boundary_leap" | "overclaiming_mechanism" | "ignores_coverage" | "none"],
    "notes": "2-3 sentences, must quote 1 short phrase from each side's argument and cite excerpt IDs if excerpts are provided."
  },
  "tier1Proven": { "text": "1 sentence", "supportedBy": ["excerpt_id_1"] },
  "tier2Unproven": { "text": "1 sentence", "supportedBy": ["excerpt_id_2"] },
  "whatWouldChangeMyMind": ["1-3 short items describing the missing excerpt evidence needed to justify structural exclusion"]
}

CRITICAL:
- Do NOT invent excerpt IDs.
- Every supportedBy must reference IDs present in the input.
- Use ONLY provided text.`;

export const STRUCTURAL_ESCALATION_USER_PROMPT_TEMPLATE = `Actor: {{ACTOR_NAME}}
Document: {{DOCUMENT_TITLE}}

EXCERPTS:
{{EXCERPTS}}

=== PRO-EXCLUSION ARGUMENT (Structural Concern) ===
{{PRO_ARGUMENT}}

=== ANTI-EXCLUSION ARGUMENT (Challenge Findings) ===
{{ANTI_ARGUMENT}}

Evaluate the arguments according to the methodological guidelines. Return a JSON object.`;

export const StructuralEscalationSchema = z.object({
    verdict: z.enum(["pro_stronger", "anti_stronger", "tie"]).describe("Which argument is methodologically stronger based strictly on the excerpts."),
    confidence: z.enum(["low", "medium", "high"]).describe("Confidence in the verdict based on excerpt clarity."),
    methodologicalCritique: z.object({
        strongerSide: z.enum(["pro", "anti", "tie"]),
        weakerSideErrors: z.array(z.enum(["argument_from_silence", "audience_to_boundary_leap", "overclaiming_mechanism", "ignores_coverage", "none"])),
        notes: z.string().describe("2-3 sentences, must quote 1 short phrase from each side's argument and cite excerpt IDs if excerpts are provided.")
    }),
    tier1Proven: z.object({
        text: z.string().describe("1 sentence stating exactly what the excerpts definitively prove."),
        supportedBy: z.array(z.string()).describe("Excerpt IDs supporting this.")
    }),
    tier2Unproven: z.object({
        text: z.string().describe("1 sentence stating what the excerpts fail to prove."),
        supportedBy: z.array(z.string()).describe("Excerpt IDs showing the gap.")
    }),
    whatWouldChangeMyMind: z.array(z.string()).describe("1-3 short items describing the missing excerpt evidence needed to justify structural exclusion.")
});
