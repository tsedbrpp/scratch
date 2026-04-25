# Policy Prism — Schema Reference

Key JSON output schemas for the system's primary analytical types. These schemas are implemented as TypeScript interfaces and Zod validation schemas in the codebase.

---

## 1. TEA Analysis (Translational Legibility)

**Source**: `src/types/tea.ts`

### TEAAnalysis (Top-Level)

| Field | Type | Description |
|---|---|---|
| `vocabularies` | `TEAVocabulary[]` | Column 1: Portable governance terms that travel across jurisdictions |
| `translations` | `TEATranslation[]` | Column 2: Per-jurisdiction re-specifications of portable vocabularies |
| `embedding_infrastructures` | `TEAInfrastructure[]` | Column 3: Material/administrative mechanisms that make translations durable |
| `apex_nodes` | `TEAApexNode[]` | Column 4: Institutional coordination centres as obligatory passage points |
| `contestations` | `TEAContestation[]` | Column 5: Sedimentation and counter-translation dynamics |
| `stratified_legibility` | `object` | Actors classified as highly legible or weakly legible |
| `propositions` | `TEAProposition[]` | Proposition evaluation with support levels |
| `short_summary` | `string` | Brief summary of the analysis |
| `raw_synthesis_text` | `string` | Track 1 qualitative narrative (when available) |

### TEAVocabulary

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `term` | `string` | The portable governance term (e.g., "risk", "fairness") |
| `description` | `string` | How the term functions in governance |

### TEATranslation

| Field | Type | Description |
|---|---|---|
| `vocabulary_id` | `string` | Links to the parent vocabulary |
| `jurisdiction` | `string` | Jurisdiction name (e.g., "EU", "Brazil") |
| `referential_drift` | `string[]` | How the term's substantive referent has shifted |
| `description` | `string` | Narrative description of translation dynamics |

### TEAContestation

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `type` | `"counter_translation" \| "sedimentation"` | Classification of contestation mode |
| `description` | `string` | Narrative description |
| `examples` | `string[]` | Concrete examples from input data |

### TEAProposition

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Proposition identifier (e.g., "P1") |
| `statement` | `string` | The proposition text |
| `support_level` | `"strong" \| "moderate" \| "weak" \| "insufficient"` | Evidence support level |
| `evidence` | `string[]` | Supporting evidence from input data |

### Stratified Legibility

| Field | Type | Description |
|---|---|---|
| `highly_legible` | `string[]` | Actors visible and governable within the compliance architecture |
| `weakly_legible` | `string[]` | Actors structurally peripheral or invisible |
| `description` | `string` | Narrative assessment |

---

## 2. Ghost Node (GNDP v1.0)

**Source**: `src/lib/ghost-nodes/types.ts`

### GhostNode

| Field | Type | Description |
|---|---|---|
| `id` | `string` | URL-safe slug (e.g., "Gig-Workers") |
| `label` | `string` | Human-readable name |
| `category` | `string` | Actor category classification |
| `isValid` | `boolean` | Whether the ghost node passed evidence gating |
| `tier` | `"Tier1" \| "Tier2" \| "Tier3"` | Validation tier |
| `absenceStrength` | `number` | 0–100 weighted absence score |
| `absenceScore` | `number \| null` | Weighted score (null if E1/E2) |
| `evidenceGrade` | `"E1" \| "E2" \| "E3" \| "E4"` | Evidence quality grade |
| `ghostType` | `string \| null` | Structural / Data / Representational / Scale / Temporal / SupplyChain |
| `absenceType` | `"Methodological" \| "Practical" \| "Ontological"` | Epistemic register of exclusion |
| `exclusionType` | `"Active" \| "Passive" \| "Structural"` | Mode of exclusion |
| `ghostReason` | `string` | Mechanism linked to dominant discourses (max 200 chars) |
| `claim` | `string` | Single testable sentence (max 160 chars) |
| `evidenceQuotes` | `EvidenceQuote[]` | Verbatim text excerpts with context |
| `discourseThreats` | `string[]` | What would change if included (max 3) |
| `missingSignals` | `MissingSignal[]` | What text would prove inclusion |
| `scoreBreakdown` | `ScoreBreakdown` | Per-dimension scoring |
| `institutionalLogics` | `object` | 0–1 profile: market, state, professional, community |

### ScoreBreakdown

| Field | Max | Description |
|---|---|---|
| `materialImpact` | 30 | Distributional/livelihood consequences |
| `oppExclusion` | 25 | Locked out of governance decision gates |
| `sanctionAbsence` | 20 | No means to trigger enforcement |
| `dataInvisibility` | 15 | Harms rendered illegible by data categories |
| `representationGap` | 10 | Deficit in formal voice |

### Counterfactual

| Field | Type | Description |
|---|---|---|
| `actorId` | `string` | Links to ghost node |
| `chokepoint` | `Chokepoint` | Role semantics: OPP name, standing actor, obligated actor, obligation type |
| `scenario` | `string` | Conditional statement (max 300 chars) |
| `estimatedImpact` | `Impact` | Level, qualifier, guidance bindingness, enforcement ladder |
| `mechanismChain` | `Step[]` | 3–8 typed steps (EvidenceCollection → Deterrence) |
| `beneficiaryMechanisms` | `ActorMechanism[]` | Who benefits from current absence |
| `shieldedActors` | `ActorMechanism[]` | Who avoids scrutiny |
| `confidence` | `Confidence` | Evidence base, epistemic partition (grounded/inferred/unknown) |
| `analyticalChallenges` | `Challenge[]` | 2–4 acknowledged downsides |

### Analyst Assessment

| Field | Type | Description |
|---|---|---|
| `status` | `"proposed" \| "confirmed" \| "contested" \| "deferred"` | Current verdict |
| `functionalRelevance` | `boolean` | Plausible governance function exists |
| `textualTrace` | `boolean` | Interests invoked without enrolment |
| `structuralForeclosure` | `boolean` | Architecture eliminates participation |
| `moralStatus` | `"moral_patient" \| "moral_agent" \| "both" \| "undetermined"` | Floridi-informed classification |
| `reflexiveNote` | `string` | Positionality record |
| `timestamp` | `string` | ISO 8601 timestamp |

---

## 3. Ecosystem Network

**Source**: `src/types/index.ts`

### Edge Types

| Field | Values | Description |
|---|---|---|
| `flowType` | Power / Logic / Ghost | Substantive nature of the flow |
| `nature` | Intermediary / Mediator | ANT classification |
| `transformationType` | Amplify / Translate / Block / Modify / Create / Dissolve | How the edge alters what passes through it |
| `impactType` | Constraint / Affordance | Whether the effect restricts or enables |
| `interconnectionType` | Material / Discursive / Hybrid / Interpretive | Register of operation |

### Actor Node

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display name |
| `type` | `string` | Actor category |
| `capacities` | `string[]` | Governance capacities |
| `mechanisms` | `string[]` | Operative mechanisms |
| `sourceRef` | `string` | Document reference |

---

*Source implementations: `src/types/tea.ts`, `src/lib/ghost-nodes/types.ts`, `src/lib/ghost-nodes/schemas.ts`, `src/types/index.ts`*
