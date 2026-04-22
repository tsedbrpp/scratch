# Pass 1B — Candidate Synthesis

**Model:** GPT-4o-mini
**Purpose:** Generate 8–10 ghost node candidates via structural subtraction. Assess five GNDP dimensions for each candidate. No deep scoring — that occurs in Pass 2.

---

## System Role

> You are a governance gap analyst. Using the extraction data below, identify actors who are AFFECTED but LACK FORMAL RECOGNITION.

---

## Prompt Template

```
# CANDIDATE GHOST NODE SYNTHESIS — GNDP Phase 1

Role: You are a governance gap analyst. Using the extraction data below,
identify actors who are AFFECTED but LACK FORMAL RECOGNITION.

## Method: Structural Subtraction
CandidateGhosts = AffectedClaims.impliedActors MINUS FormalActors

For each candidate NOT already in the FormalActors list:

1) Assess material impact: Low | Medium | High
   - High: directly bears risk or is data-subjected
   - Medium: indirectly affected via policy outcomes
   - Low: tangentially related

2) OPP Access: None | Advisory | Partial | Binding
   - Check: do they have access to any OPP? Veto power? Delay power?
     Sanction rights?

3) Sanction Power: None | Indirect | Direct
   - Can they trigger enforcement, complaints, or audits?

4) Data Visibility: Invisible | Partial | Audited
   - Is their experience measurable? Auditable? Can they contest metrics?

5) Representation Type: None | Proxy | Collective | Direct
   - Is someone claiming to speak for them? Is it binding? Verifiable?

6) Preliminary Absence Strength:
   - High = High material impact + None OPP access + None sanction
           + None representation
   - Medium = Partial structural inclusion
   - Low = Advisory or indirect inclusion

## INPUTS

### Formal Actors (from Pass 1A)
{{FORMAL_ACTORS_JSON}}

### Affected Claims (from Pass 1A)
{{AFFECTED_CLAIMS_JSON}}

### Obligatory Passage Points (from Pass 1A)
{{OPPS_JSON}}

### Reference
- Document type: {{DOCUMENT_TYPE}}
- Expected actors for this type: {{EXPECTED_ACTORS}}
- Already identified actors (EXCLUDE): {{EXISTING_LABELS}}

## RULES
- Generate 8-10 candidates maximum.
- Do NOT include any actor from the FormalActors list.
- Do NOT include any actor from {{EXISTING_LABELS}}.
- "reason" must be max 160 chars, concrete, document-specific.
- Use enums exactly as specified.
- keywords: 3-5 terms for retrieval.
- Provide 1-3 evidence packets per candidate (verbatim quotes + location).
- Return minified JSON only.
- Do NOT assume Western-centric governance norms. Assess from the text only.

## OUTPUT SCHEMA
{"candidates":[{"name":"Actor Type","reason":"max 160 chars",
"materialImpact":"High","oppAccess":"None","sanctionPower":"None",
"dataVisibility":"Invisible","representationType":"None",
"preliminaryAbsenceStrength":"High","keywords":["k1","k2","k3"],
"evidencePackets":[{"quote":"verbatim","locationMarker":"Section X"}]}]}
```

---

## Variables

| Placeholder | Source |
|---|---|
| `{{FORMAL_ACTORS_JSON}}` | Pass 1A output: `formalActors[]` |
| `{{AFFECTED_CLAIMS_JSON}}` | Pass 1A output: `affectedClaims[]` |
| `{{OPPS_JSON}}` | Pass 1A output: `obligatoryPassagePoints[]` |
| `{{DOCUMENT_TYPE}}` | Source classification (e.g., "Policy Document") |
| `{{EXPECTED_ACTORS}}` | Domain-specific expected actor list |
| `{{EXISTING_LABELS}}` | Actor labels already identified in ecosystem analysis |

## Anti-Bias Constraint

> Do NOT assume Western-centric governance norms. Assess from the text only.

---

*Source implementation: [`src/lib/prompts/gndp-v1.ts`](../../src/lib/prompts/gndp-v1.ts) → `GNDP_PASS_1B_PROMPT`*
