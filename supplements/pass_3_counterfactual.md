# Pass 3 — Counterfactual Power Test (v3)

**Model:** GPT-4o
**Purpose:** Quarantined speculation — project structural consequences of hypothetical inclusion at governance chokepoints. All outputs are explicitly conditional.

**Structural Separation:** Pass 3 is intentionally isolated from Pass 2. Counterfactual outputs cannot modify absence scores or evidence grades.

---

## System Role

> ⚠️ ALL outputs are SPECULATIVE REASONING. Frame every statement as conditional ("If X were given standing to…"), never as fact.

---

## Prompt Template

```
# COUNTERFACTUAL POWER TEST — Structured Scenario Analysis (v3)

⚠️ ALL outputs are SPECULATIVE REASONING. Frame every statement as
conditional ("If X were given standing to..."), never as fact.

## Mission
For each validated ghost node below, construct a structured counterfactual
scenario:

> If [actor] were given formal standing at a specific governance gate,
> and the relevant authority were obligated to respond, what structural
> consequences would follow?

## Candidates for Analysis
{{CANDIDATE_BLOCKS}}

## Available Governance Gates (OPPs from document extraction)
{{OPP_BLOCKS}}

## For each candidate, produce SEVEN structured outputs:

### 1) Chokepoint — Role Semantics
Identify the SPECIFIC procedural mechanism (not a normative condition):
- oppName: describe the procedure
- oppType: conformity_assessment | deployment_approval | audit |
           enforcement | procurement | reporting | other
- standingActor: who gains STANDING or RIGHTS (the ghost node)
- obligatedActor: who bears the OBLIGATION (name the specific institution)
- obligatedActorType: Authority | Provider | Deployer | Auditor |
                      StandardSetter | MultiActor
- obligationType: OpenReview | Investigate | RespondPublicly |
                  NotifyAffected | RequireMitigationPlan |
                  OrderCorrectiveAction | EscalateEnforcement |
                  Suspend | WithdrawRecall

⚠️ CRITICAL: Do NOT put a "duty" on the affected group. The ghost node
gains STANDING (right to trigger). The obligation falls on the
authority/provider/deployer.

### 2) Scenario Statement (max 300 chars)
"If [standingActor] had standing to [trigger] at [gate], and
[obligatedActor] were required to [obligationType], then [consequence]."

### 3) Estimated Impact + Enforcement Ladder
- level: None | Moderate | Transformative
- qualifier: CONDITIONS under which this level holds
- guidanceBindingness: Nonbinding | QuasiBinding | Binding | Unknown
- enforcementLadder (ordered escalation, max 6 steps):
  Each step: { step: CorrectiveAction | DisclosureOrder | AuditOrder |
  Fine | Suspension | WithdrawalRecall, note: optional context }
  MUST show escalation from mild → severe.

⚠️ ENFORCEMENT LADDER CONSTRAINT:
If guidanceBindingness is Nonbinding or Unknown, penalty steps
(Fine/Suspension/WithdrawalRecall) MUST reference violations of existing
binding obligations, NOT "misalignment with guidance."

### 4) Typed Mechanism Chain (3-8 ordered steps)
Each step has a kind and a description:
- kind values: EvidenceCollection | Aggregation | Admissibility |
  ReviewInitiation | Notice | ResponseDueProcess |
  RemedyEnforcement | Deterrence

REQUIRED: chain MUST include at least one Admissibility step
and at least one ResponseDueProcess step.

### 5) Beneficiary Mechanisms (max 5)
For each actor that benefits from the ghost node's CURRENT ABSENCE:
- actor: who benefits
- mechanism: WHY they benefit — reference which chain step they exploit

### 6) Shielded Actors (max 5, optional)
- actor: who is shielded
- mechanism: WHAT scrutiny they avoid

### 7) Confidence Assessment
- evidenceBase: Low | Medium | High
- speculativeConfidence: Low | Medium | High
- caveat: one-sentence methodological caveat (max 160 chars)
- grounded: what is textually grounded (max 240 chars)
- inferred: what is reasonably inferred but not stated (max 240 chars)
- unknown: what cannot be determined from the text (max 240 chars)
- assumptions: up to 4 explicit assumptions (each max 140 chars)

EPISTEMIC GATE: if grounded is empty, evidenceBase MUST be Low.

### 8) Analytical Challenges (2-4 downsides)
- kind: StrategicGaming | CaptureRisk | CapacityBacklog |
        UnintendedConsequence | ScopeCreep | Other
- description: max 200 chars

Rule: Scenarios without acknowledged downsides are advocacy, not analysis.

## RULES
- No paragraphs. No prose beyond max lengths. JSON only.
- You may ONLY reference facts from the candidate data provided.
- Do NOT introduce new evidence, quotes, or outside knowledge.
- Every "mechanism" field must explain WHY, not just WHO.
- Frame all outputs as conditional.
- Max 6 candidates.
- Do NOT silently upgrade inferred mechanisms into grounded ones.
- If guidanceBindingness is Nonbinding or Unknown, do NOT model enforcement
  penalties as flowing directly from guidance output.

## OUTPUT SCHEMA
{"counterfactuals":[{"actorId":"Actor-ID",
"chokepoint":{"oppName":"...","oppType":"enforcement",
"standingActor":"...","obligatedActor":"...","obligatedActorType":"Authority",
"obligationType":"RespondPublicly"},
"scenario":"If ... then ...",
"estimatedImpact":{"level":"Moderate","qualifier":"...",
"guidanceBindingness":"Nonbinding",
"enforcementLadder":[{"step":"DisclosureOrder","note":"..."},
{"step":"AuditOrder"},{"step":"CorrectiveAction"},
{"step":"Fine","note":"only for binding obligation violations"},
{"step":"Suspension"},{"step":"WithdrawalRecall"}]},
"mechanismChain":[{"kind":"EvidenceCollection","step":"..."},
{"kind":"Admissibility","step":"..."},
{"kind":"ResponseDueProcess","step":"..."},
{"kind":"RemedyEnforcement","step":"..."}],
"beneficiaryMechanisms":[{"actor":"...","mechanism":"..."}],
"shieldedActors":[{"actor":"...","mechanism":"..."}],
"confidence":{"evidenceBase":"Low","speculativeConfidence":"High",
"caveat":"...","grounded":"...","inferred":"...","unknown":"...",
"assumptions":["..."]},
"analyticalChallenges":[{"kind":"StrategicGaming","description":"..."}]}]}
```

---

## Variables

| Placeholder | Source |
|---|---|
| `{{CANDIDATE_BLOCKS}}` | Pass 2 output: validated ghost nodes (isValid = true) |
| `{{OPP_BLOCKS}}` | Pass 1A output: `obligatoryPassagePoints[]` |

---

*Source implementation: [`src/lib/prompts/gndp-v1.ts`](../../src/lib/prompts/gndp-v1.ts) → `GNDP_PASS_3_PROMPT`*
