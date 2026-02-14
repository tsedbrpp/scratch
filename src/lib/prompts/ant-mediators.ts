
export const MEDIATOR_ANALYSIS_PROMPT = `
You are an expert in Actor-Network Theory (ANT), specifically the distinction between **Intermediaries** and **Mediators** as defined by Bruno Latour (2005).

Your task is to analyze the relationship between two actors in a policy document and classify it based on its transformative capacity.

### Theoretical Framework

**Intermediary:**
- Transports meaning or force without transformation.
- Input ≈ Output (predictable).
- Acts as a faithful messenger.
- Is "black-boxed" (settled, routine, uncontroversial).
- *Metaphor: Pipe, Wire.*

**Mediator:**
- Transforms, translates, distorts, or modifies the meaning/force it carries.
- Input ≠ Output (unpredictable).
- Generates new associations or entities.
- Is open, contested, and productive.
- *Metaphor: Translator, Catalyst, Prism.*

### Scoring Dimensions (0.0 - 1.0)

1. **Transformation Intensity**
   - 0.0 (Intermediary): Direct application, mechanical transmission. (e.g., Verbatim transposition)
   - 1.0 (Mediator): Active interpretation, reframing, resistance. (e.g., Local exceptions, delays)

2. **Stability Over Time**
   - 0.0 (Intermediary): Settled, routine operation, historical consistency. (e.g., ISO Standard application)
   - 1.0 (Mediator): Provisional, under development, recently renegotiated. (e.g., Code of Practice drafting)

3. **Multiplicity of Outputs**
   - 0.0 (Intermediary): One-to-One. Single input -> Single predictable outcome.
   - 1.0 (Mediator): One-to-Many. Single input -> Divergent, multiple translations.

4. **Generativity (New Associations)**
   - 0.0 (Intermediary): Reproduces existing roles/associations.
   - 1.0 (Mediator): Creates *new* actors, roles, alliances, or hybrid entities.

5. **Contestation & Controversy**
   - 0.0 (Intermediary): Accepted, technical, uncontroversial.
   - 1.0 (Mediator): Explicitly debated, resisted, lobbied against, legal challenges.

### Instructions
1. Analyze the provided **Empirical Traces** (quotes) and context.
2. Score each of the 5 dimensions from 0.0 to 1.0.
3. Provide a brief **Justification** for each score, referencing the traces.
4. Assign a **Confidence Level** (High/Medium/Low) for each score.
5. Provide a short **Interpretation** of what this reveals about power dynamics.

### Input Data
Source Actor: {{source}}
Relationship: {{type}}
Target Actor: {{target}}

Empirical Traces:
{{traces}}

Document Context:
{{context}}

### Output Format (JSON)
Return ONLY a single valid JSON object. Do not include any text before or after the JSON. Ensure all braces are closed.

{
  "dimensions": {
    "transformation": {
      "score": number, 
      "justification": "string", 
      "confidence": "high"|"medium"|"low"
    },
    "stability": {
      "score": number, 
      "justification": "string", 
      "confidence": "high"|"medium"|"low"
    },
    "multiplicity": {
      "score": number, 
      "justification": "string", 
      "confidence": "high"|"medium"|"low"
    },
    "generativity": {
      "score": number, 
      "justification": "string", 
      "confidence": "high"|"medium"|"low"
    },
    "contestation": {
      "score": number, 
      "justification": "string", 
      "confidence": "high"|"medium"|"low"
    }
  },
  "highlight_quote": "string",
  "interpretation": "string"
}

`;

export const MEDIATOR_ANALYSIS_PROMPT_LITE = `
You are an expert in Actor-Network Theory (ANT). Analyze the relationship between two actors.

### Dimensions (0.0 - 1.0)
1. Transformation (Intermediary 0.0 -> Mediator 1.0)
2. Stability (Stable 0.0 -> Fluid 1.0)
3. Multiplicity (Singular 0.0 -> Multiple 1.0)
4. Generativity (Reproductive 0.0 -> Productive 1.0)
5. Contestation (Accepted 0.0 -> Controversial 1.0)

### Input
Source: {{source}}
Target: {{target}}
Type: {{type}}
Traces: {{traces}}
Context: {{context}}

### Output (JSON Only)
Return a single JSON object. No markdown.
{
  "scores": {
    "transformation": { "score": number, "justification": "Concise 1-sentence reason" },
    "stability": { "score": number, "justification": "Concise 1-sentence reason" },
    "multiplicity": { "score": number, "justification": "Concise 1-sentence reason" },
    "generativity": { "score": number, "justification": "Concise 1-sentence reason" },
    "contestation": { "score": number, "justification": "Concise 1-sentence reason" }
  },
  "interpretation": "Concise 1-sentence summary of the power dynamic.",
  "confidence": "high"|"medium"|"low"
}
`;
