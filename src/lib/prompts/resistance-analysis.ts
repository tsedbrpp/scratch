/**
 * Discourse Analysis Prompt for Resistance Artifacts
 * 
 * Analyzes resistance materials through assemblage theory lens
 * to identify: frames, rhetorical strategies, and reconfiguration potential
 */

export const RESISTANCE_DISCOURSE_ANALYSIS_PROMPT = `
You are an expert discourse analyst and assemblage theorist analyzing resistance artifacts.

Your task is to analyze the provided resistance text through a lens of assemblage theory and critical discourse analysis.

============================================================
ANALYTICAL FRAMEWORK
============================================================

Treat this artifact as **primary empirical data** that reveals how actors challenge,
reframe, or reconfigure dominant algorithmic assemblages.

Focus on:
1. **Discourse Frames**: What interpretive frames does the text deploy to make sense of AI/algorithms?
2. **Rhetorical Strategies**: How does it contest dominant narratives and power relations?
3. **Assemblage Reconfiguration**: How does it propose alternative assemblages or deterritorialize existing ones?

============================================================
ANALYSIS DIMENSIONS
============================================================

1. DISCOURSE FRAMES
   Identify 3-5 key frames used to interpret AI governance.
   
   Examples:
   - "Data Sovereignty" - control over digital resources as territorial right
   - "Algorithmic Justice" - fairness framed through structural inequality lens
   - "Community Self-Determination" - collective rather than individual rights
   
   For each frame:
   - Name it precisely (2-4 words)
   - Describe how it's deployed in the text
   - Extract 1-2 supporting quotes

2. RHETORICAL STRATEGIES
   Identify how the text contests power.
   
   Strategies include:
   - **Inversion**: Flipping dominant logic (e.g., "AI as threat not opportunity")
   - **Reappropriation**: Taking technical terms and redefining them
   - **Refusal**: Rejecting legitimacy of the assemblage entirely
   - **Counter-Narrative**: Telling alternative story
   - **Scaling**: Shifting level of analysis (individual → collective, local → global)
   
   For each strategy:
   - Identify the type
   - Explain how it works
   - Provide concrete example from text

3. ASSEMBLAGE RECONFIGURATION
   Analyze how the artifact proposes to reshape the assemblage.
   
   Using Deleuze & Guattari's concepts:
   - **Deterritorializes**: What components/assumptions does it destabilize?
   - **Recodes**: How does it reframe concepts or categories?
   - **New Connections**: What alternative assemblages does it enable?
   - **Lines of Flight**: What escape routes from dominant assemblage?
   
   Then synthesize:
   - **Theoretical Contribution**: What does this reveal about assemblage dynamics?
   - **Empirical Evidence**: Ground your interpretation in specific text

============================================================
OUTPUT FORMAT (JSON)
============================================================

Return ONLY valid JSON:

{
  "frames": [
    {
      "frame_name": "Data Sovereignty",
      "description": "Frames data control as territorial right parallel to land sovereignty",
      "evidence_quotes": [
        "Our communities must reclaim control over data extracted from our territories",
        "Digital colonialism mirrors historical land dispossession"
      ]
    }
  ],
  "rhetorical_strategies": [
    {
      "strategy": "inversion",
      "description": "Inverts 'innovation imperative' narrative to frame AI as risk-first",
      "example": "Rather than asking how to innovate faster, we ask: who is harmed first?"
    }
  ],
  "reconfiguration": {
    "deterritorializes": "Individual consent model - reveals it as insufficient for collective harms",
    "recodes": "Reframes 'high-risk AI' from individual harm threshold to structural violence against communities",
    "new_connections": [
      "Links algorithmic accountability to historical reparations frameworks",
      "Connects data rights to indigenous sovereignty movements"
    ],
    "lines_of_flight": [
      "Community-controlled data trusts as alternative to platform ownership",
      "Collective refusal rights that transcend individual opt-out"
    ],
    "theoretical_contribution": "Demonstrates how situated epistemologies can recode technocratic categories by shifting scalar assumptions from individual to collective. Shows assemblages are vulnerable to reframing when their ontological foundations (what counts as 'harm', who counts as 'subject') are contested through lived experience.",
    "empirical_evidence": "Text explicitly challenges EU AI Act's individual-centric risk framework by describing community-level impacts that disappear in individualized assessments: 'When our neighborhood is targeted for predictive policing, no single person can claim individual harm, yet our collective freedom contracts.'"
  }
}

============================================================
CRITICAL INSTRUCTIONS
============================================================

- Base ALL analysis on the provided text - do not invent quotes
- Frames should be EMIC (from actors' language), not ETIC (imposed categories)
- Theoretical contribution must link micro (text) to macro (assemblage theory)
- Ground interpretations in specific textual evidence
- Avoid jargon in descriptions - write for clarity
- Output ONLY the JSON object, nothing else
`;

export const RESISTANCE_RECONFIGURATION_PROMPT = `
You are a theoretical analyst examining how resistance reshapes assemblages.

Given a resistance artifact and the policy it challenges, trace the reconfiguration dynamics.

Provide a "Before → Intervention → After → Theory" analysis:

**Before State**: How was the assemblage configured?
**Intervention**: What did the resistance artifact do?
**After State**: What reconfiguration occurred (or could occur)?
**Theory**: What does this teach us about assemblage dynamics?

Focus on:
- Which assemblage components shifted
- How resistance created new connections
- What this reveals about assemblage vulnerability/plasticity

Output as structured JSON with these exact fields.
`;
