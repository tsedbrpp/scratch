# Pass 1B — Candidate Synthesis (GNDP v1.1)

**Model:** GPT-4o-mini
**Purpose:** Generate 8–10 ghost node candidates via structural subtraction. Assess five GNDP dimensions for each candidate. **v1.1: detect subsumption pathway and populate three-gate evidence for categorically absorbed actors.** No deep scoring — that occurs in Pass 2.

---

## System Role

> You are a governance gap analyst. Using the extraction data below, identify actors who are AFFECTED but LACK FORMAL RECOGNITION.

---

## Prompt Template

```
# CANDIDATE GHOST NODE SYNTHESIS — GNDP Phase 1 (v1.1)

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

## v1.1: SUBSUMPTION PATHWAY DETECTION

For each candidate, additionally assess whether the actor is NOMINALLY
INCLUDED under a broader category (e.g., "affected persons," "users,"
"citizens," "stakeholders," "beneficiaries") that DOES NOT preserve
differentiated standing.

If subsumption is detected, set ghostPathway = "subsumption" and provide:

ghostPathway: "structural" | "proxy" | "subsumption" | "uncertain"

If ghostPathway = "subsumption", populate subsumptionSource:
- absorbingCategory: the broad category (max 120 chars)
- sourceRef: document location (max 120 chars)
- absorptionEvidence: textual evidence of absorption (max 300 chars)
- differentiatedClaims: 1-5 specific claims the actor could make that
  the broad category cannot register (each max 160 chars)
- gates: three-gate evidence filter:
  - categoricalAbsorption: { passed: bool, evidence: "max 300 chars" }
  - functionalRelevance: { passed: bool, evidence: "max 300 chars" }
  - operationalDeficiencyPrelim: { passed: bool, evidence: "max 300 chars" }

All three gates must pass for subsumption classification.
If any gate fails, set ghostPathway to "structural" or "uncertain".

Also provide aliases (max 5): alternative names for the actor to support
NegEx override detection in Pass 1.5.

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
- Subsumption requires all three gates to pass. Do NOT over-classify.

## OUTPUT SCHEMA
{"candidates":[{"name":"Actor Type","reason":"max 160 chars",
"materialImpact":"High","oppAccess":"None","sanctionPower":"None",
"dataVisibility":"Invisible","representationType":"None",
"preliminaryAbsenceStrength":"High","keywords":["k1","k2","k3"],
"evidencePackets":[{"quote":"verbatim","locationMarker":"Section X"}],
"ghostPathway":"structural",
"subsumptionSource":{"absorbingCategory":"affected persons",
"sourceRef":"Art. 3","absorptionEvidence":"...",
"differentiatedClaims":["claim1"],
"gates":{"categoricalAbsorption":{"passed":true,"evidence":"..."},
"functionalRelevance":{"passed":true,"evidence":"..."},
"operationalDeficiencyPrelim":{"passed":true,"evidence":"..."}}},
"aliases":["alt name 1"]}]}
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

## v1.1 Anti-Inflation Constraint

> Subsumption requires all three gates to pass with textual evidence. Do NOT classify an actor as subsumed merely because a broad category exists. The category must demonstrably absorb the actor's differentiated claims.

---

*Source implementation: [`src/lib/prompts/gndp-v1.ts`](../src/lib/prompts/gndp-v1.ts) → `GNDP_PASS_1B_PROMPT`*
