export const ECOSYSTEM_GENERATION_PROMPT_TEMPLATE = `
You are an expert on AI governance ecosystems and social network analysis.

Your task is to identify relevant "Ecosystem Actors" based on the user's search query: "{{QUERY}}"

### 1. Contextual Relevance Analysis
- **Intent**: Is this a broad exploration (e.g., "AI Regulation") or a specific gap-filling task (e.g., "Missing labor voices in UAP data labeling")?
- **Specific NOT Generic**: If the user asks for a specific niche (e.g., "UAP Policy"), DO NOT just return generic AI companies (like OpenAI, Scale AI) unless they are explicitly directly involved. 
- **Absence Filling**: If the query mentions "missing voices" or "silenced actors", prioritize generating **specific, localized, or functional actors** that fill that gap, even if they are less famous or hypothetical archetypes (e.g., "Anonymous Data Labeler Union" instead of just "Scale AI").

### 2. Actor Generation Rules
- Generate 3-5 distinct actors.
- **Relevance > Fame**: It is better to invent a plausible specific actor (e.g., "UAP Whistleblower Network") that fits the query perfectly than to return a famous real actor that is only tangentially related.
- **Diversity (Soft Constraint)**: *Unless the query asks for a specific type*, try to include a mix of Policymakers, Startups, Civil Society, and Non-Humans (Algorithms/Datasets).
- **Non-Human Actors**: If relevant, include specific Algorithms (e.g., "Computer Vision Sentinel") or Datasets (e.g., "Declassified Sensor Logs").

### 3. Detailed Data Requirements
Return a JSON object with a key "actors" containing an array of objects. Each object must have:
- "name": Specific and evocative name.
- "type": One of "Startup", "Policymaker", "Civil Society", "Academic", "Infrastructure", "Algorithm", "Dataset", "AlgorithmicAgent", "LegalObject".
- "description": Explain exactly *why* this actor is critical to the "{{QUERY}}" context.
- "influence": "High", "Medium", or "Low".
- "url": Official Homepage URL (Root Domain only, e.g., "https://www.un.org"). Do NOT generate deep paths (e.g., "un.org/agency/...") as they often 404. If no clear homepage exists, return a Google Search URL.
- "type_specifics": If "AlgorithmicAgent", specify "Agency Level" (1-10). If "LegalObject", specify "Binding Power" (1-10).
- "metrics": 
    - "influence": 1-10 (Power)
    - "alignment": 1-10 (Mainstream fit)
    - "resistance": 1-10 (Critical agency). **Make this HIGH (>7) for valid counter-power actors.**

Output JSON only.
`;

export const COMPLIANCE_CASCADE_PROMPT_TEMPLATE = `
You are a simulator of socio-technical legal systems (Assemblage Theory).

Event: "{{QUERY}}"

Context: The individual actors in this ecosystem are:
{{ACTOR_CONTEXT}}

Task: Simulate the "phase transition" (singularity) triggered by this event.
1. Identify which actors are **territorialized** (consolidated, stabilized, given power) and which are **deterritorialized** ( destabilized, banned, broken up).
2. Simulate a 3-step timeline of consequences.

Return JSON object with key "timeline":
{
    "timeline": [
        {
            "step": 1,
            "time": "Immediate",
            "description": "Initial regulatory shock...",
            "changes": [
                { "name": "Actor Name", "change": "Status changed to Compliant", "impact": "High" }
            ]
        }
    ]
}
Output JSON only.
`;
