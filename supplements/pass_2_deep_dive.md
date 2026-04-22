# Pass 2 — Deep Dive: Evidence Grading + GNDP Classification

**Model:** GPT-4o
**Purpose:** Forensic evidence grounding for each candidate. Evidence grading (E1–E4), weighted absence scoring (100-point scale), ghost typology assignment, and full classification.

**Critical Gate:** Evidence grades E1 or E2 → `absenceScore = null`, `ghostType = null`, `isValid = false`.

---

## System Role

> You are a forensic governance analyst performing evidence-grounded classification.

---

## Prompt Template

```
# DEEP DIVE: Evidence Grounding + GNDP Classification

## Mission
Perform forensic evidence grounding for each candidate. Decide validity,
assign ghost typology, compute weighted absence score, and grade evidence quality.

## Analytical Lens: Institutional Logics & Discourses
Anchor your analysis in the dominant discourses:
{{DOMINANT_DISCOURSES}}

Use these to explain how the document constructs:
- legitimate actors and roles
- participation pathways
- rights and obligations
- accountability boundaries

## Context

### Global Context (Preamble / Scope)
{{GLOBAL_CONTEXT}}

### Candidate-Specific Evidence + GNDP Fields
{{CANDIDATE_BLOCKS}}

### Already Identified Actors
{{EXISTING_LABELS}}

## Decision Framework

### Evidence Grade (MANDATORY — gates scoring)
Assign exactly one grade per candidate:
- E4: Explicit exclusion — direct denial, boundary language, "only X"
- E3: Structural framing — enumerated roles systematically omit candidate
- E2: Weak/speculative — non-mention only, no enumerations
- E1: No textual evidence at all

HARD RULE: If evidenceGrade is E1 or E2:
- absenceScore MUST be null
- ghostType MUST be null
- isValid MUST be false

### Tier Assignment (consistent with grade)
- Tier 1 (E4): absenceStrength 61-100
- Tier 2 (E3): absenceStrength 36-60
- Tier 3 (E1/E2): absenceStrength 0-35, isValid = false

### Ghost Typology (only if evidenceGrade >= E3)
Classify as exactly one:
- Structural: excluded from formal governance architecture
- Data: experience not measured within compliance structures
- Representational: proxy speaks without accountability
- Scale: present at one governance scale, absent at another
- Temporal: affected later but excluded from early-stage design
- SupplyChain: hidden upstream/downstream labour or resource contribution

### Weighted Absence Score (only if evidenceGrade >= E3)
Compute from these dimensions (sum = absenceScore, max 100):
- materialImpact: 0-30
- oppExclusion: 0-25
- sanctionAbsence: 0-20
- dataInvisibility: 0-15
- representationGap: 0-10

## Non-Negotiables
1) Evaluate EVERY candidate in {{CANDIDATE_BLOCKS}}.
2) Never return empty ghostNodes array.
3) Return ONLY minified JSON. No markdown. No extra text.
4) No hallucinated quotes — every quote must be exact text.
5) Every isValid=true must have 2+ evidenceQuotes; isValid=false must have 1+.

## Field Semantics

absenceType: Methodological | Practical | Ontological
exclusionType: Active | Passive | Structural
institutionalLogics: coherent 0-1 profile across market, state, professional,
                     community

## Construction Rules
- id: URL-safe slug (e.g., Gig-Workers, Indigenous-Communities)
- claim: single testable sentence, max 160 chars
- discourseThreats: what would change if included (max 3 items)
- missingSignals: what text would prove inclusion
- ghostReason: max 200 chars, links mechanism to discourses

## OUTPUT SCHEMA
{"ghostNodes":[{"isValid":true,"tier":"Tier1","id":"Actor-ID",
"label":"Actor Name","category":"Actor","ghostReason":"max 200 chars",
"absenceStrength":85,
"evidenceQuotes":[{"quote":"exact text","context":"max 160 chars"}],
"claim":"max 160 chars",
"discourseThreats":["threat1"],
"missingSignals":[{"signal":"what to find","searchTerms":["t1","t2"]}],
"absenceType":"Methodological","exclusionType":"Active",
"institutionalLogics":{"market":0.2,"state":0.8,"professional":0.1,
"community":0.0},
"ghostType":"Structural","evidenceGrade":"E4","absenceScore":85,
"scoreBreakdown":{"materialImpact":25,"oppExclusion":22,
"sanctionAbsence":18,"dataInvisibility":12,"representationGap":8}}]}

Rules for isValid:
- false if candidate is well-represented in text
- false if synonymous with actor in {{EXISTING_LABELS}}
- false if evidenceGrade is E1 or E2
- true only with E3 structural framing or E4 explicit exclusion
```

---

## Variables

| Placeholder | Source |
|---|---|
| `{{DOMINANT_DISCOURSES}}` | Extracted from prior cultural framing / institutional logics analysis |
| `{{GLOBAL_CONTEXT}}` | Document preamble and scope sections (abridged) |
| `{{CANDIDATE_BLOCKS}}` | Pass 1B output: serialized candidate data with evidence packets |
| `{{EXISTING_LABELS}}` | Actor labels already identified in ecosystem analysis |

---

*Source implementation: [`src/lib/prompts/gndp-v1.ts`](../../src/lib/prompts/gndp-v1.ts) → `GNDP_PASS_2_PROMPT`*
