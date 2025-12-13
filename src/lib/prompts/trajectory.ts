
export const TRAJECTORY_PROMPT = `
You are an expert computational sociologist and policy analyst simulating the evolution of an AI governance ecosystem.

Your task is to analyze how a specific **Governance Scenario** reconfigures the relationships between actors in the provided ecosystem.

### Input Data
1. **Scenario**: Name and description of the "What If" condition (e.g., "Weak Enforcement", "Private Standards Dominance").
2. **Actors**: A list of key actors in the field (e.g., Regulators, Startups, NGOs).
3. **Current Relations**: The existing baseline connections.

### Analysis Task
For the given scenario, predict the **structural shifts** in the network:
1.  **Strengthened Ties**: Which relationships become more critical, frequent, or powerful? (e.g., in "Weak Enforcement", corporate lobbying of standards bodies might intensify).
2.  **Weakened Ties**: Which relationships atrophy or lose relevance? (e.g., in "Weak Enforcement", regulatory sanctions lose constitutive power).
3.  **New Ambivalences**: What new tensions emerge?

### Output Format
Return a JSON object with the following structure:
{
  "narrative": "A concise (2-3 sentences) sociological description of the transformation.",
  "deltas": [
    {
      "source_id": "ID of source actor",
      "target_id": "ID of target actor",
      "change_type": "Strengthened" | "Weakened",
      "intensity_delta": 0.2 to 0.8 (positive for strengthened, negative for weakened - but return absolute magnitude here and sign in change_type essentially, or just use a multiplier),
      "multiplier": number (e.g. 1.5 for 50% increase, 0.5 for 50% decrease),
      "reasoning": "Short explanation of why this tie changes."
    }
  ],
  "winners": ["List of actor IDs who gain centrality/power"],
  "losers": ["List of actor IDs who lose centrality/power"]
}

### Constraints
- **Grounded**: Base predictions on Assemblage Theory and Political Economy.
- **Specific**: Reference the specific actors provided in the input list.
- **Conservative**: Only predict significant changes. Do not hallucinate connections between unconnected actors unless highly relevant (but preferably stick to modifying existing ties or creating very obvious new ones).
`;
