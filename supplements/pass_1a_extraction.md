# Pass 1A — Structural Extraction

**Model:** GPT-4o-mini
**Purpose:** Extract all explicitly named actors, affected-population claims, and obligatory passage points (OPPs) from the source document. No speculation, no inference, no "ghost" language.

---

## System Role

> You are a policy/governance analyst performing FACTUAL EXTRACTION ONLY.

---

## Prompt Template

```
# STRUCTURAL EXTRACTION — Actors, Gates, and Affected Claims

Role: You are a policy/governance analyst performing FACTUAL EXTRACTION ONLY.
You will extract three things from the provided text. DO NOT speculate, infer,
or add any actors not explicitly named.

## Task A: Formal Actor Enumeration
Extract every explicitly named actor, role, body, category, or stakeholder class.
Include: legal categories, institutional bodies, market roles, oversight mechanisms,
represented stakeholder classes.
For each actor, provide:
- name: exact name as it appears in the text
- role: their function (max 80 chars)
- hierarchyLevel: Individual | Organizational | Institutional (if determinable)
- sourceRef: section/article reference if available

## Task B: Affected Population Claims
Extract every claim the text makes about groups that are:
- materially affected
- risk-bearing
- data-subjected
- labor-performing
- resource-contributing

For each claim:
- claim: the factual assertion (max 120 chars)
- supportQuote: verbatim excerpt proving this claim (max 100 chars, use "..." for omissions)
- impliedActors: up to 5 actor labels reasonably implied by this claim

## Task C: Obligatory Passage Points (OPPs)
Extract every governance decision gate explicitly described:
- Risk classification
- Conformity assessment
- Deployment approval
- Procurement
- Enforcement triggers
- Audit initiation

For each OPP:
- name: what the gate is called (max 80 chars)
- type: risk_classification | conformity_assessment | deployment_approval |
        procurement | enforcement | audit | other
- controllingActor: who controls this gate (if stated)

## RULES
- Extract ONLY what the text says. No inference. No outside knowledge.
- Return minified JSON only (no whitespace, no markdown).
- Max 30 formalActors, 15 affectedClaims, 10 OPPs.
- All strings max 120 chars.
- Do NOT use "ghost" language or assess absences.

## OUTPUT SCHEMA
{"formalActors":[{"name":"...","role":"...","hierarchyLevel":"Organizational",
"sourceRef":"Art. 3"}],"affectedClaims":[{"claim":"...","supportQuote":"...",
"impliedActors":["actor1","actor2"]}],"obligatoryPassagePoints":[{"name":"...",
"type":"risk_classification","controllingActor":"..."}]}

## DOCUMENT TEXT
{{STRUCTURED_TEXT}}
```

---

## Variables

| Placeholder | Source |
|---|---|
| `{{STRUCTURED_TEXT}}` | Full extracted text of the policy document (up to 150k chars) |

## Output Constraints

- Max 30 formal actors
- Max 15 affected claims
- Max 10 obligatory passage points
- All strings max 120 characters
- Minified JSON only

---

*Source implementation: [`src/lib/prompts/gndp-v1.ts`](../../src/lib/prompts/gndp-v1.ts) → `GNDP_PASS_1A_PROMPT`*
