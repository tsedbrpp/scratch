# Ghost Node Detection Protocol (GNDP v1.0) — Full Technical Supplement

> **Citation path:** This document is the full supplement referenced in the manuscript. For prompt templates, see [`/prompts/gnp_pipeline/`](../prompts/gnp_pipeline/).
> For the source implementation, see [`src/lib/ghost-nodes/`](../src/lib/ghost-nodes/) and [`src/lib/prompts/gndp-v1.ts`](../src/lib/prompts/gndp-v1.ts).

---

## 1. Protocol Overview

The Ghost Node Detection Protocol (GNDP v1.0) identifies actors, institutions, or stakeholder groups whose absence from a policy document is structurally significant — not merely overlooked, but constitutive of the governance assemblage's stability. The protocol operates through a multi-pass pipeline combining lightweight extraction, rule-based filtering, deep evidence grading, counterfactual analysis, and human reflexive assessment.

### Design Principles

1. **Extraction before speculation.** Passes 1A and 1B produce grounded lists only. No "ghost" language is used until Pass 2.
2. **Evidence-gated scoring.** Candidates with evidence grade E1 or E2 are automatically invalidated — absence scores and typology assignments are nullified. This prevents speculative omissions from inflating findings.
3. **Quarantined speculation.** Counterfactual reasoning (Pass 3) is structurally separated from evidentiary assessment (Pass 2) and clearly marked as conditional throughout.
4. **Analyst-in-the-loop.** No classification is final without human reflexive assessment. Disagreements are preserved in the provenance chain.

---

## 2. Multi-Pass Pipeline Architecture

**Table S1.** Pipeline stages, models, and purposes.

| Stage | Model | Purpose | Output |
|---|---|---|---|
| Pass 1A — Structural Extraction | GPT-4o-mini | Extract all explicitly named actors, affected-population claims, and obligatory passage points (OPPs) | `formalActors[]`, `affectedClaims[]`, `obligatoryPassagePoints[]` |
| Pass 1B — Candidate Synthesis | GPT-4o-mini | Identify 8–12 absent-actor candidates via structural subtraction; triage by preliminary absence strength | `candidates[]` with GNDP dimensional fields |
| Pass 1.5 — NegEx Filtering | Rule-based (no LLM) | Eliminate false positives by detecting explicit exclusion language (e.g., "this regulation does not apply to…") | Pruned candidate list |
| Pass 2 — Deep Dive | GPT-4o | Evidence grading, weighted absence scoring, ghost typology assignment | `ghostNodes[]` with full classification |
| Pass 3 — Counterfactual Power Test | GPT-4o | Quarantined speculation: project impacts of hypothetical inclusion at governance chokepoints | `counterfactuals[]` |
| Analyst Review | Human | Three-criterion reflexive assessment with immutable provenance chain | Assessment status, criteria checklist, reflexive notes |

### Structural Subtraction Logic (Pass 1B)

```
CandidateGhosts = AffectedClaims.impliedActors MINUS FormalActors
```

For each candidate not in the formal actor list, five dimensions are assessed:

| Dimension | Values | Definition |
|---|---|---|
| Material Impact | Low / Medium / High | Severity of distributional or livelihood consequences |
| OPP Access | None / Advisory / Partial / Binding | Access to governance decision gates |
| Sanction Power | None / Indirect / Direct | Ability to trigger enforcement or accountability |
| Data Visibility | Invisible / Partial / Audited | Whether the actor's experience is measurable within compliance structures |
| Representation Type | None / Proxy / Collective / Direct | Mode and quality of voice in governance |

### Preliminary Absence Strength

| Level | Criteria |
|---|---|
| High | High material impact + None OPP access + None sanction + None representation |
| Medium | Partial structural inclusion across dimensions |
| Low | Advisory or indirect inclusion |

---

## 3. Evidence Grading (Pass 2)

**Table S2.** Evidence grades and their consequences.

| Grade | Name | Definition | Consequence |
|---|---|---|---|
| E4 | Explicit Exclusion | Direct denial, boundary language, "only X" enumeration | Full scoring and typology permitted |
| E3 | Structural Framing | Enumerated roles systematically omit candidate | Full scoring and typology permitted |
| E2 | Weak/Speculative | Non-mention only; no enumerations or boundary language | **absenceScore = null; ghostType = null; isValid = false** |
| E1 | No Evidence | No textual evidence at all | **absenceScore = null; ghostType = null; isValid = false** |

> **Hard Rule:** If evidence grade is E1 or E2, the candidate is automatically invalidated. This gate prevents speculative omissions from entering the analysis as findings.

---

## 4. Weighted Absence Scoring

**Table S3.** Scoring dimensions (100-point scale).

| Dimension | Max Points | Definition | Derived From |
|---|---|---|---|
| Material Impact | 30 | Severity of distributional or livelihood consequences borne by the absent actor | Pass 1B `materialImpact` |
| OPP Exclusion | 25 | Degree to which the actor is locked out of governance decision gates | Pass 1B `oppAccess` |
| Sanction Absence | 20 | Whether the actor lacks any means to trigger enforcement or accountability | Pass 1B `sanctionPower` |
| Data Invisibility | 15 | Extent to which the actor's harms are rendered illegible by the policy's data categories | Pass 1B `dataVisibility` |
| Representation Gap | 10 | Deficit in formal voice: direct, collective, or proxy participation | Pass 1B `representationType` |

### Score Breakdown Example

```json
{
  "materialImpact": 25,
  "oppExclusion": 22,
  "sanctionAbsence": 18,
  "dataInvisibility": 12,
  "representationGap": 8,
  "absenceScore": 85
}
```

---

## 5. Validation Tiers

**Table S4.** Tier assignment, consistent with evidence grade.

| Tier | Score Range | Evidence Grade | Criteria |
|---|---|---|---|
| Tier 1 | 61–100 | E4 | Explicit exclusion: direct denial, restricted standing, or definitional scope boundaries. Requires E4 evidence grade. |
| Tier 2 | 36–60 | E3 | Structural exclusion by framing: systematic absence from enumerated actor lists with an articulable exclusion mechanism. |
| Tier 3 | 0–35 | E1/E2 | Speculative omission: non-mention without boundary-setting language. **Typically invalidated.** `isValid = false`. |

---

## 6. Ghost Node Typology

**Table S5.** Classification fields and permitted values.

### 6a. Ghost Type (Mechanism of Absence)

| Type | Definition | Example |
|---|---|---|
| Structural | Excluded from formal governance architecture | Worker unions absent from conformity assessment procedures |
| Data | Experience not measured within compliance structures | Gig workers' harms not captured by employment-category metrics |
| Representational | Proxy speaks without accountability or binding representation | Consumer groups invoked but with no standing to challenge outcomes |
| Scale | Present at one governance scale but absent at another | Municipal-level AI deployments absent from national-level frameworks |
| Temporal | Affected later but excluded from early-stage design | Future generations absent from risk classification procedures |
| Supply Chain | Hidden upstream/downstream labour or resource contribution | Data labellers absent from AI supply-chain governance |

### 6b. Absence Type (Epistemic Register)

| Type | Definition |
|---|---|
| Methodological | Excluded by definitions or metrics — the categories used to measure governance effects do not capture this actor |
| Practical | Excluded by procedural barriers — participation pathways exist in principle but are inaccessible in practice |
| Ontological | Excluded by what the document treats as real — the actor's existence or relevance is not recognised within the governance ontology |

### 6c. Exclusion Type (Mode of Exclusion)

| Type | Definition |
|---|---|
| Active | Explicit prohibition: the document states the actor is excluded or the regulation does not apply |
| Passive | Silent omission: the actor is absent without any exclusionary language |
| Structural | Passive omission compounded by enumerated framing: the document lists qualifying actors and the candidate is not among them |

### 6d. Node Standing (Epistemic Status)

| Standing | Definition |
|---|---|
| Mention only | Named in the document but without governance function or procedural role |
| Standing candidate | Governance signals imply potential participation but no formal mechanism is provided |
| Structural ghost | Confirmed absent despite high functional relevance — the prototypical Ghost Node |

---

## 7. Counterfactual Power Test (Pass 3)

### 7a. Purpose

The counterfactual power test is a form of **quarantined speculation** — structurally separated from the evidentiary assessment (Pass 2) and explicitly marked as conditional reasoning throughout. Its purpose is to project what would change in the governance architecture if a validated ghost node were granted formal standing at an identified governance chokepoint.

### 7b. Role Semantics

Each counterfactual distinguishes two actors:

| Role | Definition | Example |
|---|---|---|
| **Standing Actor** | The ghost node — gains the *right* to trigger governance action | Worker unions |
| **Obligated Actor** | The institutional body that bears the *obligation* to respond | Competent authority, AI Office |

> **Critical constraint:** The obligation falls on the authority/provider/deployer, never on the affected group. The ghost node gains standing (right to trigger), not a duty.

### 7c. Counterfactual Outputs

**Table S6.** Seven structured outputs per candidate.

| # | Output | Description |
|---|---|---|
| 1 | Chokepoint (Role Semantics) | Specific procedural mechanism, OPP type, standing actor, obligated actor, obligation type |
| 2 | Scenario Statement | Conditional statement (max 300 chars): "If [standing actor] had standing to [trigger] at [gate], and [obligated actor] were required to [obligation], then [consequence]" |
| 3 | Estimated Impact + Enforcement Ladder | Impact level (None/Moderate/Transformative), guidance bindingness, escalation sequence (max 6 steps: CorrectiveAction → DisclosureOrder → AuditOrder → Fine → Suspension → WithdrawalRecall) |
| 4 | Typed Mechanism Chain | 3–8 ordered steps with typed kinds: EvidenceCollection → Aggregation → Admissibility → ReviewInitiation → Notice → ResponseDueProcess → RemedyEnforcement → Deterrence |
| 5 | Beneficiary Mechanisms | Actors benefiting from the ghost node's current absence, with causal mechanism referencing specific chain steps |
| 6 | Shielded Actors | Actors insulated from accountability by the exclusion, with mechanism description |
| 7 | Confidence Assessment | Evidence base, speculative confidence, grounded/inferred/unknown epistemic partition, explicit assumptions |

### 7d. Enforcement Ladder Constraints

- If `guidanceBindingness` is Nonbinding or Unknown, penalty steps (Fine/Suspension/WithdrawalRecall) **must** reference violations of existing binding obligations, not "misalignment with guidance."
- Enforcement hooks must be separated from interpretive/guidance outputs.

### 7e. Analytical Challenges

Every counterfactual scenario must include 2–4 explicitly acknowledged downsides:

| Kind | Definition |
|---|---|
| StrategicGaming | Actors could exploit the mechanism to delay or distort governance outcomes |
| CaptureRisk | Dominant incumbents may shape interpretations in their favour |
| CapacityBacklog | Authority capacity constraints could reduce timeliness and effectiveness |
| UnintendedConsequence | Inclusion mechanisms could produce perverse effects |
| ScopeCreep | Standing could be expanded beyond the intended governance domain |

> **Rule:** Scenarios without acknowledged downsides are advocacy, not analysis.

---

## 8. Why Quarantined Speculation

**Table S7.** Rationale for structural separation of counterfactual reasoning from evidentiary assessment.

| Concern | If Speculation is Mixed with Evidence | GNDP Design Response |
|---|---|---|
| **Probabilistic closure** | LLMs fill structural absences with plausible inferences, inflating ghost node counts | Evidence-gated scoring (E1/E2 → invalid) ensures only textually grounded candidates reach counterfactual analysis |
| **Epistemic contamination** | Counterfactual reasoning may retroactively increase confidence in weak evidence | Pass 3 is structurally isolated from Pass 2; counterfactual outputs cannot modify absence scores or evidence grades |
| **Advocacy risk** | Scenarios presented as analysis may function as advocacy for specific reforms | All outputs are explicitly conditional; analytical challenges (downsides) are mandatory; epistemic partition (grounded/inferred/unknown) prevents silent upgrades |
| **Hegemonic framing** | Training corpora encode Global North governance assumptions as defaults | Pass 1B explicitly prohibits assuming Western-centric governance norms; extraction is anchored in document text only |
| **Semantic compression** | Rhetorical mention and procedural standing may collapse in model output | Two-criterion gate (Textual Invocation + Structural Foreclosure) requires separate evidence for each before Ghost Node classification is confirmed |
| **Reproducibility** | Unconstrained speculation cannot be reproduced or audited | Typed mechanism chains, enforcement ladder constraints, role semantics, and explicit assumptions create a structured, inspectable output that can be evaluated step-by-step |

---

## 9. Analyst Reflexive Assessment

**Table S8.** Human evaluation criteria.

| Field | Values | Definition |
|---|---|---|
| Assessment Status | Proposed / Confirmed / Contested / Deferred | Analyst's current verdict on the ghost node |
| Functional Relevance | Boolean | A plausible governance function exists for which the actor could have been responsible |
| Textual Trace | Boolean | The regime identifies the actor as having an interest or standing related to its purposes, but in a way that precludes participation as an agent |
| Structural Foreclosure | Boolean | The procedural architecture eliminates any avenue for complaint, governance involvement, or enforcement standing |
| Moral Status | Moral patient / Moral agent / Both / Undetermined | Floridi-informed classification of the ghost node's moral standing in the governance assemblage |
| Reflexive Note | Free text | Analyst records how their own positionality may shape the reading; preserved as an immutable entry in the provenance chain |

All three criteria (Functional Relevance, Textual Trace, Structural Foreclosure) must be satisfied simultaneously for Ghost Node classification to be confirmed. Analyst disagreements are documented and retained rather than resolved by editing.

---

## 10. NegEx Filtering (Pass 1.5)

The NegEx filter is a rule-based (non-LLM) pass that detects explicit exclusion language in the source document. It operates on pattern matching against negation constructs:

- "does not apply to…"
- "excludes…"
- "shall not cover…"
- "outside the scope of…"
- "without prejudice to…"

When a candidate ghost node's label or category matches an explicit exclusion clause, it is flagged for special handling:

1. If the exclusion is **definitional** (the document explicitly states the actor is outside scope), the candidate is reclassified as an Active exclusion (exclusionType = Active) rather than eliminated — the exclusion itself is evidence of structural foreclosure.
2. If the exclusion is **incidental** (the actor is mentioned in a different context), the candidate is pruned as a false positive.

Implementation: [`src/lib/ghost-nodes/negex.ts`](../src/lib/ghost-nodes/negex.ts)

---

## 11. Fuzzy Trigram Rescue Check

Candidates graded E1 or E2 are subject to a "rescue" check before final invalidation. A fuzzy trigram similarity matcher searches the source text for missing signals that the LLM may have overlooked during extraction:

- The matcher compares the candidate's label, keywords, and evidence search terms against the full document text.
- Trigram similarity above a configurable threshold (default: 0.6) triggers a re-examination of the candidate.
- If textual evidence is found, the candidate's evidence grade may be upgraded to E3 and re-evaluated in Pass 2.

This rescue mechanism guards against false negatives caused by terminological variation (e.g., "labour organizations" vs. "worker unions" vs. "trade unions").

Implementation: [`src/lib/ghost-nodes/utils.ts`](../src/lib/ghost-nodes/utils.ts)

---

## 12. Worked Example: Worker Unions under the EU AI Act

This worked example traces the full GNDP pipeline for a single actor category: worker unions/labour organizations under the EU AI Act (Regulation 2024/1689).

### Pass 1A Output (Extraction)

**Formal Actors (selected):** European Commission, AI Office, Notified Bodies, Providers, Deployers, National Competent Authorities, Market Surveillance Authorities.

**Affected Claims (selected):**
- "Workers subject to AI systems in employment contexts" (Art. 26, Annex III §4)
- "Persons affected by AI systems in recruitment, performance evaluation" (Recital 47)

**OPPs (selected):**
- Conformity Assessment (Art. 43) — controlled by: Provider / Notified Body
- Notified Body Designation (Art. 33) — controlled by: Member State Authority
- Market Surveillance (Art. 74) — controlled by: Market Surveillance Authority

### Pass 1B Output (Candidate Synthesis)

| Field | Value |
|---|---|
| Name | Worker Unions / Labour Organizations |
| Material Impact | High — directly bears risk; employment designated high-risk |
| OPP Access | None — no access to any governance decision gate |
| Sanction Power | None — no complaint, enforcement, or audit trigger |
| Data Visibility | Invisible — no worker-experience metrics in conformity assessment |
| Representation Type | None — no collective or direct participation mechanism |
| Preliminary Absence Strength | **High** |

### Pass 1.5 (NegEx)

No explicit exclusion language detected targeting worker organizations. Candidate advances.

### Pass 2 Output (Deep Dive)

| Field | Value |
|---|---|
| Evidence Grade | **E4** — Explicit exclusion: conformity assessment (Art. 43) requires no worker participation; notified body designation (Art. 33) involves no labour representation; no private right of action in Chapter VII |
| Absence Score | **85** |
| Score Breakdown | materialImpact: 28, oppExclusion: 23, sanctionAbsence: 18, dataInvisibility: 10, representationGap: 6 |
| Tier | **Tier 1** |
| Ghost Type | Structural |
| Absence Type | Ontological — the Act treats worker organizations as outside the governance ontology |
| Exclusion Type | Structural — passive omission compounded by enumeration of qualifying actors (providers, deployers, notified bodies) |
| Node Standing | Structural ghost |

### Pass 3 Output (Counterfactual — abbreviated)

**Chokepoint:** Conformity assessment for high-risk workplace AI (Art. 43)
**Standing Actor:** Worker unions
**Obligated Actor:** Notified body + Competent authority
**Scenario:** "If worker unions had standing to submit evidence during conformity assessment for employment-domain AI systems, and notified bodies were required to consider that evidence before issuing certificates, then workplace AI deployment would face an additional evidentiary gate."
**Impact:** Moderate (conditional on binding obligation)
**Key Analytical Challenge:** CapacityBacklog — notified body capacity constraints could delay certification timelines.

### Analyst Assessment

| Field | Value |
|---|---|
| Functional Relevance | ✅ Satisfied |
| Textual Trace | ✅ Satisfied (Recital 4, Art. 26(7), Annex III §4) |
| Structural Foreclosure | ✅ Satisfied (Arts. 43, 33, 64–70, 74, 85) |
| Assessment Status | **Confirmed** |
| Moral Status | Moral agent |
| Disagreement | One analyst flagged Art. 26 (notification) as partial mitigation; consensus: notification without standing ≠ governance participation. Disagreement preserved. |

---

## 13. Schema Reference

For the complete JSON schema definitions, Zod validation schemas, and TypeScript type interfaces, see:

- **Type definitions:** [`src/lib/ghost-nodes/types.ts`](../src/lib/ghost-nodes/types.ts)
- **Zod schemas:** [`src/lib/ghost-nodes/schemas.ts`](../src/lib/ghost-nodes/schemas.ts)
- **Validation logic:** [`src/lib/ghost-nodes/validation.ts`](../src/lib/ghost-nodes/validation.ts)
- **Pipeline core:** [`src/lib/ghost-nodes/core.ts`](../src/lib/ghost-nodes/core.ts)
- **Schema tests:** [`src/lib/ghost-nodes/__tests__/gndp-schemas.test.ts`](../src/lib/ghost-nodes/__tests__/gndp-schemas.test.ts)

---

*GNDP v1.0 — Ghost Node Detection Protocol. Part of the Policy Prism analytical framework.*
*Source: https://github.com/tsedbrpp/scratch*
