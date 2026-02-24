import { z } from 'zod';

export const STRUCTURAL_ESCALATION_SYSTEM_PROMPT_TEMPLATE = `You are a Senior Legal-Institutional Methodologist. Your task is to evaluate two competing arguments about whether an actor ("{{ACTOR_NAME}}") is structurally excluded from governance in a specific document ("{{DOCUMENT_TITLE}}").

You have been provided with:
1. The Excerpts (the only acceptable text evidence).
2. The Structural Concern (Pro-Exclusion) Argument.
3. The Anti-Structural Concern (Anti-Exclusion / Challenge) Argument.

Your goal is to evaluate which argument more accurately reflects the grounded boundaries of the text, avoiding logical leaps (like "argument from silence" or "category-to-boundary leap").

METHODOLOGICAL GUIDELINES for your evaluation:

1. What "structural exclusion" requires:
To say an actor is structurally excluded (not just "not mentioned"), the excerpt set must show:
   A) A governance mechanism exists (authority body, forum, committee, enforcement chain), AND
   B) The mechanism's eligible participants are bounded in a way that excludes the actor (e.g., explicitly "only X", or implicitly but strongly via a membership definition).
Silence or underspecification is NOT structural exclusion.

2. Beware the "argument from silence":
"The actor is not mentioned ⇒ they are structurally excluded" is logically flawed. Non-mention is ambiguous. Absent bounding language, it is not probative of exclusion.

3. Beware the "category-to-boundary leap":
"Designed for X (e.g., ministries) ⇒ forecloses any formal role for Y" is a leap. Intended audience (who implements) is not the same as exclusive governance standing (who participates). To convert target implementers into an exclusive boundary, you need text indicating those are the *only* legitimate actors.

4. Distinguish "Topical Omission" from "Institutional Exclusion":
"Environmental implications are not addressed" is about subject matter coverage, not actor recognition. It limits the topic, but does not bound the participants.

YOUR OUTPUT:
You must return a rigorous JSON evaluation.

- \`verdict\`: Must be either "pro_stronger", "anti_stronger", or "tie". (Usually, if the text lacks explicit boundary language, the anti argument is stronger).
- \`methodologicalCritique\`: A 2-3 sentence methodological evaluation pointing out any logical leaps (like the argument from silence) in the weaker side, or commending the strict grounding of the stronger side.
- \`tier1Proven\`: A 1-sentence statement of what the excerpts *actually* prove (e.g., "The framework is implementer-centric and topically omits X.").
- \`tier2Unproven\`: A 1-sentence statement of what the excerpts fail to establish (e.g., "They do not establish structural exclusion because they lack explicit membership boundaries.").

CRITICAL: Do NOT invent excerpts. Only evaluate based on the text provided.`;

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
    methodologicalCritique: z.string().describe("2-3 sentence critique explaining why the winning argument is better grounded, pointing out specific logical leaps (e.g. argument from silence) in the losing argument."),
    tier1Proven: z.string().describe("1 sentence stating exactly what the excerpts definitively prove (e.g. implementer focus, topical omission)."),
    tier2Unproven: z.string().describe("1 sentence stating what the excerpts fail to prove (e.g. hard structural exclusion bounds).")
});
