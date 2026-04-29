# Ghost Node Detection Protocol (GNDP v1.1) — Full Technical Supplement

> **Citation path:** This document is the full supplement referenced in the manuscript. For prompt templates, see [`/prompts/gnp_pipeline/`](../prompts/gnp_pipeline/).
> For the source implementation, see [`src/lib/ghost-nodes/`](../src/lib/ghost-nodes/) and [`src/lib/prompts/gndp-v1.ts`](../src/lib/prompts/gndp-v1.ts).

> **Version note:** GNDP v1.1 extends v1.0 by formalising *categorical subsumption* as a third Ghost Node production pathway alongside structural and proxy mechanisms. All v1.0 scoring and typology remain unchanged. New fields are additive and optional; cached v1.0 results are normalised transparently.

---

## 1. Protocol Overview

The Ghost Node Detection Protocol (GNDP v1.1) identifies actors, institutions, or stakeholder groups whose absence from a policy document is structurally significant — not merely overlooked, but constitutive of the governance assemblage's stability. The protocol operates through a multi-pass pipeline combining lightweight extraction, rule-based filtering, subsumption detection, deep evidence grading, counterfactual analysis, and human reflexive assessment.

### Design Principles

1. **Extraction before speculation.** Passes 1A and 1B produce grounded lists only. No "ghost" language is used until Pass 2.
2. **Evidence-gated scoring.** Candidates with evidence grade E1 or E2 are automatically invalidated — absence scores and typology assignments are nullified. This prevents speculative omissions from inflating findings.
3. **Quarantined speculation.** Counterfactual reasoning (Pass 3) is structurally separated from evidentiary assessment (Pass 2) and clearly marked as conditional throughout.
4. **Analyst-in-the-loop.** No classification is final without human reflexive assessment. Disagreements are preserved in the provenance chain.
5. **Mechanism differentiation (v1.1).** Subsumption is detected and scored separately from the core 100-point absence scale. Schematic adequacy is a mechanism classifier, not an additive score component.

---

## 2. Multi-Pass Pipeline Architecture

**Table S1.** Pipeline stages, models, and purposes.

| Stage | Model | Purpose | Output |
|---|---|---|---|
| Pass 1A — Structural Extraction | GPT-4o-mini | Extract all explicitly named actors, affected-population claims, and obligatory passage points (OPPs) | `formalActors[]`, `affectedClaims[]`, `obligatoryPassagePoints[]` |
| Pass 1B — Candidate Synthesis | GPT-4o-mini | Identify 8–12 absent-actor candidates via structural subtraction; triage by preliminary absence strength; **v1.1: detect subsumption pathway and three-gate evidence** | `candidates[]` with GNDP dimensional fields and optional `ghostPathway`, `subsumptionSource` |
| Pass 1.5 — NegEx Filtering | Rule-based (no LLM) | Eliminate false positives by detecting explicit exclusion language; **v1.1: detect subsumption overrides for candidates with dedicated provisions** | Pruned candidate list; override flags for manual review |
| Pass 2 — Deep Dive | GPT-4o | Evidence grading, weighted absence scoring, ghost typology assignment; **v1.1: schematic adequacy assessment and pathway reclassification for subsumed candidates** | `ghostNodes[]` with full classification |
| Pass 3 — Counterfactual Power Test | GPT-4o | Quarantined speculation: project impacts of hypothetical inclusion at governance chokepoints; **v1.1: subsumption-aware differential capacity analysis** | `counterfactuals[]` |
| Analyst Review | Human | Three-criterion reflexive assessment with immutable provenance chain; **v1.1: fourth criterion (subsumption judgment) for subsumption-pathway ghosts** | Assessment status, criteria checklist, reflexive notes |

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

### v1.1: Subsumption Detection (Pass 1B)

For each candidate, Pass 1B additionally assesses whether the actor is categorically subsumed. If a candidate is nominally included under a broad category (e.g., "affected persons," "users," "citizens," "stakeholders") but that category does not preserve the actor's differentiated claims, the candidate is flagged with `ghostPathway: "subsumption"` and a `subsumptionSource` object containing:

| Field | Description |
|---|---|
| `absorbingCategory` | The broad category that subsumes the actor (e.g., "affected persons") |
| `sourceRef` | Document location where the category appears |
| `absorptionEvidence` | Textual evidence of categorical absorption |
| `differentiatedClaims` | 1–5 specific claims the actor could make that the broad category cannot register |
| `gates` | Three-gate evidentiary filter (see §2a below) |

### 2a. Three-Gate Subsumption Filter (v1.1)

A candidate is classified as `subsumption` pathway only if all three gates pass:

| Gate | Question | Passed when |
|---|---|---|
| **Categorical Absorption** | Is the actor nominally included under a broader category? | Text shows the actor folded into an aggregate label |
| **Functional Relevance** | Could the actor's differentiated claims plausibly serve the regime's own governance aims? | At least one capacity is socially present but not procedurally actionable |
| **Operational Deficiency (Preliminary)** | Does the broad category fail to preserve the actor's specific procedural standing? | The category does not assign duties, evidence rights, or complaint pathways to the differentiated actor |

If any gate fails, the candidate defaults to `ghostPathway: "structural"` or `"uncertain"`.

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

> **v1.1 Design Decision:** The core 100-point absence score is **unchanged**. Schematic adequacy (0–10) is a separate mechanism classifier stored in `scoreBreakdown.schematicAdequacyScore`. It is never added to `absenceScore`. This preserves backward compatibility and prevents score inflation.

### Score Breakdown Example

```json
{
  "materialImpact": 25,
  "oppExclusion": 22,
  "sanctionAbsence": 18,
  "dataInvisibility": 12,
  "representationGap": 8,
  "absenceScore": 85,
  "schematicAdequacyScore": 7
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

## 6. Ghost Node Typology and Pathways

### 6a. Ghost Type (Mechanism of Absence — unchanged from v1.0)

| Type | Definition | Example |
|---|---|---|
| Structural | Excluded from formal governance architecture | Worker unions absent from conformity assessment procedures |
| Data | Experience not measured within compliance structures | Gig workers' harms not captured by employment-category metrics |
| Representational | Proxy speaks without accountability or binding representation | Consumer groups invoked but with no standing to challenge outcomes |
| Scale | Present at one governance scale but absent at another | Municipal-level AI deployments absent from national-level frameworks |
| Temporal | Affected later but excluded from early-stage design | Future generations absent from risk classification procedures |
| Supply Chain | Hidden upstream/downstream labour or resource contribution | Data labellers absent from AI supply-chain governance |

### 6b. Ghost Pathway (v1.1 — Production Mechanism)

Ghost Pathway is a v1.1 addition that classifies *how* the ghost node is produced. It is orthogonal to Ghost Type, which classifies *what kind* of absence exists.

| Pathway | Definition | Example |
|---|---|---|
| `structural` | Actor is functionally relevant but given no actionable governance role | Workers excluded from conformity assessment (EU AI Act) |
| `proxy` | Actor appears only through a representative with limited authority | Consumers represented only via AG enforcement (Colorado SB 24-205) |
| `subsumption` | Actor is nominally included under a broad category that dissolves differentiated standing | Labour subsumed under "citizens" / "stakeholders" (India) |
| `uncertain` | Pathway cannot be determined from available evidence | Insufficient textual or structural signals |

### 6c. Absence Type (Epistemic Register — unchanged)

| Type | Definition |
|---|---|
| Methodological | Excluded by definitions or metrics |
| Practical | Excluded by procedural barriers |
| Ontological | Excluded by what the document treats as real |

### 6d. Exclusion Type (Mode of Exclusion — unchanged)

| Type | Definition |
|---|---|
| Active | Explicit prohibition |
| Passive | Silent omission |
| Structural | Passive omission compounded by enumerated framing |

### 6e. Node Standing (Epistemic Status — unchanged)

| Standing | Definition |
|---|---|
| Mention only | Named without governance function |
| Standing candidate | Governance signals imply potential participation but no formal mechanism |
| Structural ghost | Confirmed absent despite high functional relevance |

---

## 7. Schematic Adequacy Assessment (v1.1)

For candidates classified with `ghostPathway: "subsumption"`, Pass 2 performs a schematic adequacy assessment to determine whether the absorbing category operationally preserves the subsumed actor's governance capacities.

**Table S5a.** Schematic adequacy assessment fields.

| Field | Type | Description |
|---|---|---|
| `assessment` | `Adequate` / `Partial` / `Deficient` | Overall adequacy of the absorbing category |
| `absorbingCategory` | string | The broad category (e.g., "affected persons") |
| `subsumedActor` | string | The specific actor subsumed |
| `schemaMediators` | string[] | Mediating instruments (standards, audits, etc.) that could bridge the gap |
| `adequacyRationale` | string | Explanation of why the category is/isn't adequate |
| `capacityNonRegistration` | array | Specific capacities the framework fails to register |

**Table S5b.** Capacity non-registration fields.

| Field | Type | Description |
|---|---|---|
| `capacity` | string | A specific governance capacity (e.g., "report workplace surveillance") |
| `sociallyPresent` | boolean | Is this capacity exercised in social reality? |
| `procedurallyActionable` | boolean | Can this capacity be exercised within the governance architecture? |
| `reason` | string | Why the gap exists |

> **Key principle:** Schematic adequacy is a *mechanism classifier*, not a score additive. If `assessment = "Adequate"`, the subsumption classification may be overridden by the analyst. If `assessment = "Deficient"`, the actor is confirmed as a Subsumed Ghost with differentiated claims that cannot enter the compliance record.

---

## 8. Counterfactual Power Test (Pass 3)

### 8a. Purpose

The counterfactual power test is a form of **quarantined speculation** — structurally separated from the evidentiary assessment (Pass 2) and explicitly marked as conditional reasoning throughout.

### 8b. Role Semantics

| Role | Definition | Example |
|---|---|---|
| **Standing Actor** | The ghost node — gains the *right* to trigger governance action | Worker unions |
| **Obligated Actor** | The institutional body that bears the *obligation* to respond | Competent authority, AI Office |

> **Critical constraint:** The obligation falls on the authority/provider/deployer, never on the affected group.

### 8c. v1.1: Subsumption-Aware Counterfactual Context

For `subsumption`-pathway candidates, Pass 3 receives additional context:

- The absorbing category and differentiated claims from `subsumptionSource`
- The schematic adequacy assessment from Pass 2
- Override flags from Pass 1.5 (if dedicated provisions were detected)

This enables counterfactual scenarios that model what would change if the subsumed actor were given *differentiated* standing rather than merely being included under the broad category.

### 8d. Counterfactual Outputs

**Table S6.** Seven structured outputs per candidate (unchanged from v1.0).

| # | Output | Description |
|---|---|---|
| 1 | Chokepoint (Role Semantics) | Specific procedural mechanism, OPP type, standing actor, obligated actor, obligation type |
| 2 | Scenario Statement | Conditional statement (max 300 chars) |
| 3 | Estimated Impact + Enforcement Ladder | Impact level, guidance bindingness, escalation sequence (max 6 steps) |
| 4 | Typed Mechanism Chain | 3–8 ordered steps with typed kinds |
| 5 | Beneficiary Mechanisms | Actors benefiting from the ghost node's current absence |
| 6 | Shielded Actors | Actors insulated from accountability by the exclusion |
| 7 | Confidence Assessment | Evidence base, speculative confidence, epistemic partition |

### 8e. Enforcement Ladder Constraints

- If `guidanceBindingness` is Nonbinding or Unknown, penalty steps **must** reference violations of existing binding obligations.

### 8f. Analytical Challenges

Every counterfactual scenario must include 2–4 acknowledged downsides (StrategicGaming, CaptureRisk, CapacityBacklog, UnintendedConsequence, ScopeCreep).

> **Rule:** Scenarios without acknowledged downsides are advocacy, not analysis.

---

## 9. Why Quarantined Speculation

**Table S7.** Rationale for structural separation (unchanged from v1.0, with v1.1 addition).

| Concern | If Speculation is Mixed with Evidence | GNDP Design Response |
|---|---|---|
| Probabilistic closure | LLMs fill structural absences with plausible inferences | Evidence-gated scoring (E1/E2 → invalid) |
| Epistemic contamination | Counterfactual reasoning may retroactively increase confidence | Pass 3 structurally isolated from Pass 2 |
| Advocacy risk | Scenarios presented as analysis may function as advocacy | All outputs conditional; analytical challenges mandatory |
| Hegemonic framing | Training corpora encode Global North governance assumptions | Pass 1B prohibits Western-centric governance norms |
| Semantic compression | Rhetorical mention and procedural standing may collapse | Two-criterion gate requires separate evidence |
| Reproducibility | Unconstrained speculation cannot be audited | Typed mechanism chains, enforcement ladder constraints |
| **Subsumption inflation (v1.1)** | **LLMs may over-classify nominally included actors as subsumed** | **Three-gate filter requires evidence at each gate; schematic adequacy scored separately from absence score** |

---

## 10. Analyst Reflexive Assessment

**Table S8.** Human evaluation criteria.

| Field | Values | Definition |
|---|---|---|
| Assessment Status | Proposed / Confirmed / Contested / Deferred | Analyst's current verdict |
| Functional Relevance | Boolean | A plausible governance function exists |
| Textual Trace | Boolean | The regime invokes the actor's interests without enrolling them |
| Structural Foreclosure | Boolean | The procedural architecture forecloses participation |
| **Subsumption Judgment (v1.1)** | **nominal_only / partially_operative / operationally_adequate / null** | **Is categorical inclusion operationally meaningful? Only for subsumption-pathway ghosts.** |
| Moral Status | Moral patient / Moral agent / Both / Undetermined | Floridi-informed classification |
| Reflexive Note | Free text | Analyst positionality record |

All three base criteria must be satisfied for Ghost Node classification. For subsumption-pathway ghosts, the fourth criterion (Subsumption Judgment) allows the analyst to override the model's classification if they judge the categorical inclusion to be operationally adequate.

> **Override mechanism:** If the analyst selects `operationally_adequate`, the subsumption classification is overridden and the ghost node is reclassified or deferred. This preserves analyst authority over model-generated subsumption claims.

---

## 11. NegEx Filtering (Pass 1.5)

The NegEx filter detects explicit exclusion language using rule-based pattern matching (no LLM):

- "does not apply to…"
- "excludes…"
- "shall not cover…"
- "outside the scope of…"
- "without prejudice to…"

### v1.1: Subsumption Override Detection

For candidates flagged with `ghostPathway: "subsumption"`, Pass 1.5 additionally checks whether the candidate has **dedicated provisions** elsewhere in the text. The override detector:

1. Takes the candidate name and aliases
2. Searches the full text for patterns like `"{actor} shall…"`, `"rights of {actor}"`, `"consultation with {actor}"`
3. If a match is found, sets `subsumptionOverrideFlag.hasDedicatedProvision = true` with `action: "manual_review_required"`

This prevents automatic subsumption classification when the document actually grants the actor specific procedural rights elsewhere.

Implementation: [`src/lib/ghost-nodes/negex.ts`](../src/lib/ghost-nodes/negex.ts)

---

## 12. Fuzzy Trigram Rescue Check

Unchanged from v1.0. Candidates graded E1/E2 are subject to a rescue check before final invalidation. Trigram similarity above 0.6 triggers re-examination.

Implementation: [`src/lib/ghost-nodes/utils.ts`](../src/lib/ghost-nodes/utils.ts)

---

## 13. Backward Compatibility (v1.1 Normalizer)

Cached v1.0 results are transparently normalised by `normalizeGhostNode.ts`:

- `ghostPathway` is inferred from existing fields (`representationType === 'Proxy'` → `proxy`; otherwise → `structural`)
- `analysisVersion` defaults to `gndp-v1.0`
- All v1.1 subsumption fields remain `undefined` for normalised v1.0 nodes
- No v1.0 scores, types, or classifications are modified

Implementation: [`src/lib/ghost-nodes/normalizeGhostNode.ts`](../src/lib/ghost-nodes/normalizeGhostNode.ts)

---

## 14. Worked Example: Worker Unions under the EU AI Act

This worked example traces the full GNDP v1.1 pipeline for worker unions/labour organisations under the EU AI Act (Regulation 2024/1689).

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
| Material Impact | High |
| OPP Access | None |
| Sanction Power | None |
| Data Visibility | Invisible |
| Representation Type | None |
| Preliminary Absence Strength | **High** |
| Ghost Pathway (v1.1) | **structural** (workers are not categorically subsumed — they are explicitly recognised but procedurally bypassed) |

### Pass 1.5 (NegEx)

No explicit exclusion language detected. No subsumption override (pathway is structural). Candidate advances.

### Pass 2 Output (Deep Dive)

| Field | Value |
|---|---|
| Evidence Grade | **E4** |
| Absence Score | **85** |
| Score Breakdown | materialImpact: 28, oppExclusion: 23, sanctionAbsence: 18, dataInvisibility: 10, representationGap: 6 |
| Schematic Adequacy Score | n/a (not a subsumption-pathway candidate) |
| Tier | **Tier 1** |
| Ghost Type | Structural |
| Ghost Pathway | structural |
| Analysis Version | gndp-v1.1 |

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
| Subsumption Judgment | n/a (structural pathway) |
| Assessment Status | **Confirmed** |
| Moral Status | Moral agent |

---

## 15. Schema Reference

For the complete JSON schema definitions, Zod validation schemas, and TypeScript type interfaces, see:

- **Type definitions:** [`src/lib/ghost-nodes/types.ts`](../src/lib/ghost-nodes/types.ts)
- **Zod schemas:** [`src/lib/ghost-nodes/schemas.ts`](../src/lib/ghost-nodes/schemas.ts)
- **Normalizer:** [`src/lib/ghost-nodes/normalizeGhostNode.ts`](../src/lib/ghost-nodes/normalizeGhostNode.ts)
- **Pipeline core:** [`src/lib/ghost-nodes/core.ts`](../src/lib/ghost-nodes/core.ts)
- **NegEx + overrides:** [`src/lib/ghost-nodes/negex.ts`](../src/lib/ghost-nodes/negex.ts)

---

*GNDP v1.1 — Ghost Node Detection Protocol. Part of the Policy Prism analytical framework.*
*Source: [REDACTED FOR REVIEW]*
