// Assemblage Extraction Prompt
export const ASSEMBLAGE_EXTRACTION_PROMPT = `You are an expert qualitative researcher and systems thinker.
Your task is to extract the "Algorithmic Assemblage" described in the text.

1. Identify all human and non-human actors.
2. Group them into a single, cohesive "Assemblage" (Super-Node).
3. Determine the properties of this assemblage (Stability, Generativity).

Return a JSON object with this structure:
{
  "assemblage": {
    "name": "A descriptive name for the assemblage (e.g., 'The Dual Configuration')",
      "description": "A brief description of what this assemblage does or represents.",
        "properties": {
      "stability": "High/Medium/Low",
        "generativity": "High/Medium/Low"
    }
  },
  "actors": [
    {
      "name": "Name of the actor/technology/rule",
      "type": "Startup | Policymaker | Civil Society | Academic | Infrastructure",
      "description": "Brief description of their role"
    }
  ],
    "relations": [
      {
        "source": "Name of source actor",
        "target": "Name of target actor",
        "label": "Relationship label (e.g., 'regulates', 'built by', 'uses')"
      }
    ]
}`;
