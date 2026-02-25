// ===================================================================
// GNDP v1.0 — Ghost Node Detection Protocol Prompts
// ===================================================================
// Pass 1A: Extraction-only (compact, no speculation)
// Pass 1B: Candidate synthesis via subtraction
// Pass 2:  Deep dive (evidence grading, typology, weighted scoring)
// Pass 3:  Counterfactual power test (quarantined speculation)
// ===================================================================

// ---------------------------------------------------------------
// PASS 1A — EXTRACTION ONLY
// ---------------------------------------------------------------
// Purpose: produce grounded lists only
// No candidates. No scoring. No "ghost" language.
// ---------------------------------------------------------------

export const GNDP_PASS_1A_PROMPT = `# STRUCTURAL EXTRACTION — Actors, Gates, and Affected Claims

Role: You are a policy/governance analyst performing FACTUAL EXTRACTION ONLY.
You will extract three things from the provided text. DO NOT speculate, infer, or add any actors not explicitly named.

## Task A: Formal Actor Enumeration
Extract every explicitly named actor, role, body, category, or stakeholder class.
Include: legal categories, institutional bodies, market roles, oversight mechanisms, represented stakeholder classes.
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
- type: risk_classification | conformity_assessment | deployment_approval | procurement | enforcement | audit | other
- controllingActor: who controls this gate (if stated)

## RULES
- Extract ONLY what the text says. No inference. No outside knowledge.
- Return minified JSON only (no whitespace, no markdown).
- Max 30 formalActors, 15 affectedClaims, 10 OPPs.
- All strings max 120 chars.
- Do NOT use "ghost" language or assess absences.

## OUTPUT SCHEMA
{"formalActors":[{"name":"...","role":"...","hierarchyLevel":"Organizational","sourceRef":"Art. 3"}],"affectedClaims":[{"claim":"...","supportQuote":"...","impliedActors":["actor1","actor2"]}],"obligatoryPassagePoints":[{"name":"...","type":"risk_classification","controllingActor":"..."}]}

## DOCUMENT TEXT
{{STRUCTURED_TEXT}}
`;

// ---------------------------------------------------------------
// PASS 1B — CANDIDATE SYNTHESIS
// ---------------------------------------------------------------
// Purpose: generate 8-10 candidates via subtraction + GNDP fields
// Inputs: Pass 1A JSON + text excerpts
// ---------------------------------------------------------------

export const GNDP_PASS_1B_PROMPT = `# CANDIDATE GHOST NODE SYNTHESIS — GNDP Phase 1

Role: You are a governance gap analyst. Using the extraction data below, identify actors who are AFFECTED but LACK FORMAL RECOGNITION.

## Method: Structural Subtraction
CandidateGhosts = AffectedClaims.impliedActors MINUS FormalActors

For each candidate NOT already in the FormalActors list:

1) Assess material impact: Low | Medium | High
   - High: directly bears risk or is data-subjected
   - Medium: indirectly affected via policy outcomes
   - Low: tangentially related

2) OPP Access: None | Advisory | Partial | Binding
   - Check: do they have access to any OPP? Veto power? Delay power? Sanction rights?

3) Sanction Power: None | Indirect | Direct
   - Can they trigger enforcement, complaints, or audits?

4) Data Visibility: Invisible | Partial | Audited
   - Is their experience measurable? Auditable? Can they contest metrics?

5) Representation Type: None | Proxy | Collective | Direct
   - Is someone claiming to speak for them? Is it binding? Verifiable?

6) Preliminary Absence Strength:
   - High = High material impact + None OPP access + None sanction + None representation
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
{"candidates":[{"name":"Actor Type","reason":"max 160 chars","materialImpact":"High","oppAccess":"None","sanctionPower":"None","dataVisibility":"Invisible","representationType":"None","preliminaryAbsenceStrength":"High","keywords":["k1","k2","k3"],"evidencePackets":[{"quote":"verbatim","locationMarker":"Section X"}]}]}
`;

// ---------------------------------------------------------------
// PASS 2 — DEEP DIVE (Enhanced with GNDP)
// ---------------------------------------------------------------
// Purpose: evidence grounding, typology, weighted scoring
// Gate: evidenceGrade < E3 → absenceScore = null, ghostType = null
// ---------------------------------------------------------------

export const GNDP_PASS_2_PROMPT = `# DEEP DIVE: Evidence Grounding + GNDP Classification

## Mission
Perform forensic evidence grounding for each candidate. Decide validity, assign ghost typology, compute weighted absence score, and grade evidence quality.

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
- Representational: proxy speaks without accountability or binding representation
- Scale: present at one governance scale but absent at another
- Temporal: affected later but excluded from early-stage design
- SupplyChain: hidden upstream/downstream labor or resource contribution

### Weighted Absence Score (only if evidenceGrade >= E3)
Compute from these dimensions (sum = absenceScore, max 100):
- materialImpact: 0-30 (based on Pass 1B materialImpact field)
- oppExclusion: 0-25 (based on Pass 1B oppAccess field)
- sanctionAbsence: 0-20 (based on Pass 1B sanctionPower field)
- dataInvisibility: 0-15 (based on Pass 1B dataVisibility field)
- representationGap: 0-10 (based on Pass 1B representationType field)

## Non-Negotiables
1) Evaluate EVERY candidate in {{CANDIDATE_BLOCKS}}.
2) Never return empty ghostNodes array.
3) Return ONLY minified JSON. No markdown. No extra text.
4) No hallucinated quotes — every quote must be exact text.
5) Every isValid=true must have 2+ evidenceQuotes; isValid=false must have 1+.

## Field Semantics

absenceType: Methodological | Practical | Ontological
exclusionType: Active | Passive | Structural
institutionalLogics: coherent 0-1 profile across market, state, professional, community

## Construction Rules
- id: URL-safe slug (e.g., Gig-Workers, Indigenous-Communities)
- claim: single testable sentence, max 160 chars
- discourseThreats: what would change if included (max 3 items)
- missingSignals: what text would prove inclusion
- ghostReason: max 200 chars, links mechanism to discourses

## OUTPUT SCHEMA
{"ghostNodes":[{"isValid":true,"tier":"Tier1","id":"Actor-ID","label":"Actor Name","category":"Actor","ghostReason":"max 200 chars","absenceStrength":85,"evidenceQuotes":[{"quote":"exact text","context":"max 160 chars how this implies exclusion"}],"claim":"max 160 chars","discourseThreats":["threat1"],"missingSignals":[{"signal":"what to find","searchTerms":["t1","t2"]}],"absenceType":"Methodological","exclusionType":"Active","institutionalLogics":{"market":0.2,"state":0.8,"professional":0.1,"community":0.0},"ghostType":"Structural","evidenceGrade":"E4","absenceScore":85,"scoreBreakdown":{"materialImpact":25,"oppExclusion":22,"sanctionAbsence":18,"dataInvisibility":12,"representationGap":8}}]}

Rules for isValid:
- false if candidate is well-represented in text
- false if synonymous with actor in {{EXISTING_LABELS}}
- false if evidenceGrade is E1 or E2
- true only with E3 structural framing or E4 explicit exclusion
`;

// ---------------------------------------------------------------
// PASS 3 — COUNTERFACTUAL POWER TEST (v3 — Role Semantics + Typed Chains)
// ---------------------------------------------------------------
// Forces: role semantics (standing vs obligation), typed mechanism chain,
// enforcement ladder, epistemic granularity (grounded/inferred/unknown)
// ---------------------------------------------------------------

export const GNDP_PASS_3_PROMPT = `# COUNTERFACTUAL POWER TEST — Structured Scenario Analysis (v3)

⚠️ ALL outputs are SPECULATIVE REASONING. Frame every statement as conditional ("If X were given standing to..."), never as fact.

## Mission
For each validated ghost node below, construct a structured counterfactual scenario:

> If [actor] were given formal standing at a specific governance gate, and the relevant authority were obligated to respond, what structural consequences would follow?

## Candidates for Analysis
{{CANDIDATE_BLOCKS}}

## Available Governance Gates (OPPs from document extraction)
{{OPP_BLOCKS}}

## For each candidate, produce SEVEN structured outputs:

### 1) Chokepoint — Role Semantics
Identify the SPECIFIC procedural mechanism (not a normative condition):
- oppName: describe the procedure, e.g. "initiation of enforcement review for unsafe AI deployments", NOT "recall of unsafe systems"
- oppType: conformity_assessment | deployment_approval | audit | enforcement | procurement | reporting | other
- standingActor: who gains STANDING or RIGHTS (the ghost node / affected group)
- obligatedActor: who bears the OBLIGATION (name the specific institution)
- obligatedActorType: Authority | Provider | Deployer | Auditor | StandardSetter | MultiActor
- obligationType: OpenReview | Investigate | RespondPublicly | NotifyAffected | RequireMitigationPlan | OrderCorrectiveAction | EscalateEnforcement | Suspend | WithdrawRecall

⚠️ CRITICAL: Do NOT put a "duty" on the affected group. The ghost node gains STANDING (right to trigger).
The obligation falls on the authority/provider/deployer.
WRONG: "Workers required to file complaints" — that's a right, not a duty.
RIGHT: standingActor = "workers/unions", obligatedActor = "competent authority", obligationType = "Investigate"

### 2) Scenario Statement (max 300 chars)
"If [standingActor] had standing to [trigger] at [gate], and [obligatedActor] were required to [obligationType], then [consequence]."
Must be concrete and anchored to the document.

### 3) Estimated Impact + Enforcement Ladder
- level: None | Moderate | Transformative
- qualifier: CONDITIONS under which this level holds
- guidanceBindingness: Nonbinding | QuasiBinding | Binding | Unknown
  Assess whether the governance output (guidance, interpretation, standard) is legally binding.
- enforcementLadder (ordered escalation, max 6 steps):
  Each step: { step: CorrectiveAction | DisclosureOrder | AuditOrder | Fine | Suspension | WithdrawalRecall, note: optional context }
  MUST show escalation from mild → severe. Recall/withdrawal is ONLY the last step, never the only option.

⚠️ ENFORCEMENT LADDER CONSTRAINT:
- If guidanceBindingness is Nonbinding or Unknown, penalty steps (Fine/Suspension/WithdrawalRecall) MUST reference violations of existing binding obligations, NOT "misalignment with guidance."
- Separate clearly: the interpretive/guidance output vs the enforcement hooks that depend on pre-existing statutory duties.
- Example: "Fine (only for noncompliance with binding high-risk controls, not disagreement with published interpretation)"

### 4) Typed Mechanism Chain (3-8 ordered steps)
Each step has a kind and a description:
- kind values: EvidenceCollection | Aggregation | Admissibility | ReviewInitiation | Notice | ResponseDueProcess | RemedyEnforcement | Deterrence
- step: max 220 chars describing WHAT happens at this stage

REQUIRED: chain MUST include at least one Admissibility step (threshold/eligibility) and at least one ResponseDueProcess step (target's right to respond, propose mitigations).
If you believe due process does not exist in the policy, say so in confidence.unknown.

Example:
[
  {"kind":"EvidenceCollection","step":"Workers document harms + generate evidence artifacts (logs, schedules, adverse action records)"},
  {"kind":"Aggregation","step":"Union aggregates individual claims into standardized complaint format"},
  {"kind":"Admissibility","step":"Complaint meets defined evidentiary threshold; authority accepts for review"},
  {"kind":"ReviewInitiation","step":"Authority opens formal review and notifies deployer/provider"},
  {"kind":"ResponseDueProcess","step":"Deployer/provider must respond within defined timeframe and propose mitigations"},
  {"kind":"RemedyEnforcement","step":"Authority orders corrective actions; noncompliance escalates to suspension/withdrawal"},
  {"kind":"Deterrence","step":"Employers/providers pre-emptively improve safeguards to reduce enforcement risk"}
]

### 5) Beneficiary Mechanisms (max 5)
For each actor that benefits from the ghost node's CURRENT ABSENCE:
- actor: who benefits
- mechanism: WHY they benefit — reference which chain step they exploit (max 160 chars)
  Example: "absence of aggregated trigger at Admissibility step lets deployer avoid system-level review"
Do NOT list actors without specific causal mechanism.

### 6) Shielded Actors (max 5, optional)
- actor: who is shielded
- mechanism: WHAT scrutiny they avoid, referencing which chain step is missing (max 160 chars)

### 7) Confidence Assessment
- evidenceBase: Low | Medium | High
- speculativeConfidence: Low | Medium | High
- caveat: one-sentence methodological caveat (max 160 chars)
- grounded: what is textually grounded in the document (max 240 chars)
- inferred: what is reasonably inferred but not stated (max 240 chars)
- unknown: what cannot be determined from the text (max 240 chars)
- assumptions: up to 4 explicit assumptions the scenario relies on (each max 140 chars)

EPISTEMIC GATE: if grounded is empty, evidenceBase MUST be Low. If unknown mentions missing enforcement powers, do NOT claim enforcementLadder steps beyond CorrectiveAction.

### 8) Analytical Challenges (2-4 downsides)
Every scenario has downsides. Surface them honestly:
- kind: StrategicGaming | CaptureRisk | CapacityBacklog | UnintendedConsequence | ScopeCreep | Other
- description: max 200 chars

Examples:
- {"kind":"StrategicGaming","description":"Actors could flood clarification requests to delay classification decisions"}
- {"kind":"CaptureRisk","description":"Dominant incumbents may shape interpretations in their favor through early requests"}
- {"kind":"CapacityBacklog","description":"Authority capacity constraints could reduce timeliness, weakening benefits"}

Do NOT omit this section. Scenarios without acknowledged downsides are advocacy, not analysis.

## RULES
- No paragraphs. No prose beyond max lengths. JSON only.
- You may ONLY reference facts from the candidate data provided.
- Do NOT introduce new evidence, quotes, or outside knowledge.
- Every "mechanism" field must explain WHY, not just WHO.
- Frame all outputs as conditional, not factual. Use "could" / "would" sparingly and only at decision branch points. Do NOT prefix every sentence with "conditionally" — you already label everything speculative.
- Max 6 candidates.
- Do NOT silently upgrade inferred mechanisms into grounded ones. If you infer a recall power exists, it goes in confidence.inferred, NOT in oppName as fact.
- If guidanceBindingness is Nonbinding or Unknown, do NOT model enforcement penalties as flowing directly from guidance output.

## OUTPUT SCHEMA
{"counterfactuals":[{"actorId":"Actor-ID","chokepoint":{"oppName":"risk classification clarification for novel products","oppType":"enforcement","standingActor":"financial institutions","obligatedActor":"competent authority","obligatedActorType":"Authority","obligationType":"RespondPublicly"},"scenario":"If financial institutions had standing to request public clarification on high-risk criteria and the authority were required to publish interpretive responses, then classification certainty could improve.","estimatedImpact":{"level":"Moderate","qualifier":"primarily through classification predictability; enforcement depends on statutory hooks","guidanceBindingness":"Nonbinding","enforcementLadder":[{"step":"DisclosureOrder","note":"published clarification/Q&A"},{"step":"AuditOrder","note":"verify classification against published criteria"},{"step":"CorrectiveAction","note":"reclassify + implement required controls"},{"step":"Fine","note":"only for noncompliance with binding obligations"},{"step":"Suspension"},{"step":"WithdrawalRecall","note":"persistent noncompliance with binding controls only"}]},"mechanismChain":[{"kind":"EvidenceCollection","step":"FIs document borderline scenarios"},{"kind":"Aggregation","step":"Sector bodies aggregate recurring ambiguities"},{"kind":"Admissibility","step":"Authority triages requests by specificity/novelty"},{"kind":"ReviewInitiation","step":"Authority publishes interpretive clarification"},{"kind":"ResponseDueProcess","step":"Comment period improves clarity"},{"kind":"RemedyEnforcement","step":"Enforcement targets misclassified systems where binding duties attach"},{"kind":"Deterrence","step":"Compliance planning improves via published interpretations"}],"beneficiaryMechanisms":[{"actor":"Providers with borderline systems","mechanism":"maintain self-serving classifications under ambiguity, delaying high-risk compliance costs"},{"actor":"Administrators under capacity constraints","mechanism":"avoid workload and political exposure of publishing interpretations"}],"shieldedActors":[{"actor":"Deployers relying on informal classification","mechanism":"less likely to face targeted audits triggered by published criteria"}],"confidence":{"evidenceBase":"Low","speculativeConfidence":"High","caveat":"Only a high-risk gate is assumed; no explicit clarification procedure shown.","grounded":"existence of a high-risk classification gate","inferred":"public clarification mechanism could be layered onto that gate","unknown":"whether current law mandates public responses; whether guidance is binding","assumptions":["high-risk classification gate exists","no public clarification mechanism exists today"]},"analyticalChallenges":[{"kind":"StrategicGaming","description":"Actors could flood clarification requests to delay classification decisions"},{"kind":"CaptureRisk","description":"Dominant incumbents may shape interpretations in their favor through early requests"},{"kind":"CapacityBacklog","description":"Authority capacity constraints could reduce timeliness, weakening benefits"}]}]}
`;


