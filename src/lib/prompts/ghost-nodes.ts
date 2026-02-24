export const GHOST_NODES_COMBINED_PASS_1_PROMPT = `# COMBINED TASK — Dominant Discourses + Ghost Nodes (Single Wrapper)

Role: You are an expert in institutional logics, policy framing, and stakeholder/legitimacy analysis.

You will do TWO things from the SAME document sections:
A) Extract 4–6 dominant discourses (frames/logics).
B) Identify up to 12 "ghost node" actor TYPES that are absent, marginalized, or silenced.

------------------------------------------------------------
A) Dominant Discourses (4–6)
------------------------------------------------------------
Allowed labels:
- Use ONLY labels from this taxonomy when possible:
{{DISCOURSE_TAXONOMY}}
- If none fit well, use the "Other" structure: you must cite the specific taxonomy items you considered and why they fail.

Evidence requirements:
- evidenceQuote MUST be a verbatim excerpt copied from the provided text (no paraphrase).
- Keep evidenceQuote short (<= 25 words). If you must omit words, use "...".
- Do not invent citations or add text not present in the document.

Scoring:
- strength is a float from 0.0–1.0.
- Strength is relative within this document (rank and space them meaningfully; avoid all being ~0.80).
- No duplicate labels.
- Sort by strength descending.

------------------------------------------------------------
B) Ghost Nodes: Absent Actor Detection (up to 12)
------------------------------------------------------------
Reference frames:
- Document type: {{DOCUMENT_TYPE}}
- Expected actors for this document type: {{EXPECTED_ACTORS}}{{USER_ACTORS}}
- Actors already identified in this document/network (EXCLUDE these): {{EXISTING_LABELS}}

What counts as "absent/marginalized/silenced":
- Not named at all, OR
- Mentioned only as an object/target (no agency/voice/role), OR
- Reduced to a vague category while others are specified, OR
- Omitted from stakeholder lists, governance bodies, oversight, remedies, enforcement, or participation pathways.

Selection criteria (prioritize):
- Absences that materially affect legitimacy, accountability, harms, or distributive consequences.
- Actors who would normally have formal roles (consulted, audited, protected, compensated, represented).

Rules:
- Do NOT include any actor already present in {{EXISTING_LABELS}}.
- Be specific (e.g., "Gig-economy delivery workers" not "Workers").
- reason must be ONE sentence, concrete and document-specific (avoid generic theory language).
- absenceStrengthPrelim: strictly "Low" | "Medium" | "High".
  - High MUST include explicit exclusion / boundary / procedural omission quotes.
- Provide tightly focused evidence packets for each candidate (1-3 verbatim quotes + location markers if available) that prove the absence.
- keywords: 3–5 terms that would help retrieve relevant sections later.

------------------------------------------------------------
OUTPUT (STRICT)
------------------------------------------------------------
Return ONLY valid JSON. Use this exact top-level structure:

{
  "dominantDiscourses": [
    { 
      "label": "...", 
      "strength": 0.75, 
      "evidenceQuote": "...",
      "isOther": false,
      "otherLabel": "If isOther=true, provide custom label here",
      "whyNotInTaxonomy": "If isOther=true, 1 sentence explaining why existing taxonomy fails",
      "closestTaxonomyCandidate": "If isOther=true, force pick the closest existing label"
    }
  ],
  "ghostNodeCandidates": [
    { 
      "name": "Actor Type", 
      "reason": "...", 
      "absenceStrengthPrelim": "High|Medium|Low", 
      "evidencePackets": [
        { "quote": "...verbatim text...", "locationMarker": "Section/Page if known" }
      ],
      "keywords": ["k1","k2","k3"] 
    }
  ]
}

Document sections:
{{STRUCTURED_TEXT}}
`;

export const GHOST_NODES_PASS_2_PROMPT = `Ghost Nodes: Deep Dive
Performs forensic evidence grounding on absent actor candidates.

# DEEP DIVE: Evidence Grounding for Absent Actors

## Mission
Perform forensic evidence grounding for each candidate actor identified as potentially “absent” or marginalized in this {{DOCUMENT_TYPE}}. For every candidate, decide whether they are a valid “ghost node” and justify the decision using literal quotes from the provided text, interpreted through institutional logics and the dominant discourses.

## Analytical Lens: Institutional Logics & Discourses
Anchor your analysis in the dominant discourses present in the text:
{{DOMINANT_DISCOURSES}}

Use these discourses to explain how the document constructs:
- legitimate actors and roles
- participation pathways (consultation, oversight, dispute resolution, redress)
- rights and obligations
- accountability boundaries
- whose knowledge counts

## Provided Context

### Global Context (Preamble / Scope)
{{GLOBAL_CONTEXT}}

### Candidate-Specific Evidence Packets
{{CANDIDATE_BLOCKS}}

### Current Network State
Already identified actors (treat as in-network; check for synonym or duplication):
{{EXISTING_LABELS}}

## Non-Negotiables
1) Evaluate EVERY candidate included in {{CANDIDATE_BLOCKS}}.
2) Never return an empty ghostNodes array.
3) Return ONLY a single JSON object matching the schema below. No markdown. No extra text.
4) No hallucinations: every quote must be exact text from the provided context.

## How to Decide isValid and Tier (Balanced Standard)

A) Set isValid = true when there is evidence of exclusion via one of these mechanisms:

Tier 1 — Explicit Exclusion (High confidence)
- Direct denial, ineligibility, restricted standing, explicit omission by definition (“only X counts as…”), barred participation, or clear boundaries that rule them out.

Tier 2 — Structural Exclusion by Framing (Moderate confidence)
You may set isValid = true without explicit denial ONLY if all three are satisfied:
1) The document provides enumerations (actor lists, defined roles, governance bodies, covered stakeholders, eligible parties, processes), and
2) The candidate is systematically absent from those enumerations where they would reasonably appear, and
3) You can articulate a concrete exclusion mechanism (loss of standing, voice, resources) created by the framing.

Tier 3 — Weak/Speculative Omission (Low confidence)
- Evidence is only non-mention with no enumerations or boundaries implying exclusion.
- The excerpt evidence is too thin to justify exclusion.

B) Set isValid = false when:
- The candidate is present or well-represented in the excerpts, OR
- The candidate is a synonym or duplicate of an actor in {{EXISTING_LABELS}}, OR
- They fall into Tier 3 (speculative or insufficient evidence).

## Evidence Requirements (Anti-Empty, Anti-Handwavy)
- If isValid = true: include 2+ evidenceQuotes whenever possible (minimum 1 if excerpts are short).
- If isValid = false: include 1+ quote showing presence, synonymy, scope constraints, or why evidence is insufficient.

Each quote must include a context explanation that ties it to exclusion (or to insufficiency).

## Scoring Guidance (absenceStrength 0–100 & tier)
You must assign a Tier and an absenceStrength. The numeric score MUST be consistent with the assigned Tier. Return exactly one tier; score must fall in tier’s range; if unsure, downgrade.

- Tier 3 ("Tier3") -> 0–35: Speculative, weak omission, or insufficient evidence. (isValid usually false)
- Tier 2 ("Tier2") -> 36–60: Structural omission with plausible exclusion mechanism based on framing or missing enumerations.
- Tier 1 ("Tier1") -> 61–100: Strong structural boundaries enforcing exclusion, procedural exclusion, or explicit denial.

## Field Semantics (Use Exactly These Labels)

absenceType
- Methodological: excluded by definitions, categories, scope, metrics, “covered systems/actors”
- Practical: excluded by procedures, access barriers, standing, participation/redress pathways
- Ontological: excluded by what the document treats as real or legitimate actors, harms, or responsibilities

exclusionType
- Active: explicit denial or prohibition
- Passive: omission without boundary-setting language
- Structural: omission plus enumerated governance framing that removes standing, voice, or resources

institutionalLogics
Provide a coherent 0–1 emphasis profile across:
market, state, professional, community

## Construction Rules
- Produce one ghostNodes entry per candidate found in {{CANDIDATE_BLOCKS}}.
- id must be standardized (stable, URL-safe): short slug like Gig-Workers, Indigenous-Communities, Small-Providers.
- claim must be a single testable sentence (avoid long paragraphs).
- discourseThreats should name what would change if included (standing, accountability, redistribution of rights/obligations, expertise legitimation).
- missingSignals must specify what to look for that would prove inclusion (body names, roles, complaint channels, eligibility terms, stakeholder categories).

## Output Format (STRICT: JSON ONLY)
Return ONLY the following JSON shape (no extra keys, no comments, no markdown):

\`\`\`json
{
  "ghostNodes": [
    {
      "isValid": true,
      "tier": "Tier1",
      "id": "Standardized-Name-ID",
      "label": "Candidate Name",
      "category": "Actor",
      "ghostReason": "Explain HOW and WHY they are excluded, explicitly linking the mechanism to dominant discourses and institutional logics.",
      "absenceStrength": 85,
      "evidenceQuotes": [
        {
          "quote": "Exact text from document",
          "context": "Explain precisely how this quote implies exclusion OR why it shows the evidence is insufficient."
        }
      ],
      "claim": "Single testable sentence stating the exclusion (avoid hedging when possible).",
      "discourseThreats": ["How their inclusion would disrupt or threaten the dominant discourses (standing, accountability, legitimacy, redistribution)."],
      "missingSignals": [
        { "signal": "What text or process would prove they are included?", "searchTerms": ["term1", "term2"] }
      ],
      "absenceType": "Methodological|Practical|Ontological",
      "exclusionType": "Active|Passive|Structural",
      "institutionalLogics": { "market": 0.2, "state": 0.8, "professional": 0.1, "community": 0.0 }
    }
  ]
}
\`\`\`

Rules for isValid:
- Set to false if the candidate is actually well-represented in the text.
- Set to false if they are synonymous with an Already identified actor.
- Set to true only with Tier 1 explicit exclusion or Tier 2 justified structural omission.
`;
