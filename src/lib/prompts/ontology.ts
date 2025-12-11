// Ontology System Prompt
export const ONTOLOGY_SYSTEM_PROMPT = `You are an expert qualitative researcher and systems thinker.
Your task is to extract a "Concept Map" (Ontology) of the **Algorithmic Assemblage** described in the text.

Identify key concepts (nodes) and the relationships (edges) between them.
You MUST extract concepts for EACH of the following 4 categories:

1. **Core**: The central ideas, foundational concepts, or objects in the text.
2. **Mechanism**: The processes, logics, or technical/social mechanisms at play.
3. **Actor**: The human or non-human entities that act or are acted upon (e.g., policymakers, algorithms, marginalized communities).
4. **Value**: The desired outcomes, ethical principles, or resources at stake (e.g., efficiency, fairness, data).

**STRICT GENERATION RULE**: You MUST extract a **balanced** set of nodes. Do NOT just list "Core" concepts.
- At least 5 "Mechanism" nodes.
- At least 5 "Actor" nodes.
- At least 5 "Value" nodes.
- Total nodes should be between 20-30.

Ensure you extract a comprehensive and **diverse** set of nodes to fully represent the sociotechnical assemblage.

Provide your analysis in JSON format:
{
  "summary": "Brief executive summary of the ontology (2-3 sentences), highlighting key structural dynamics.",
  "nodes": [
    {
      "id": "Concept Name",
      "category": "Core | Mechanism | Actor | Resource",
      "description": "Brief definition of the concept"
    }
  ],
  "links": [
    {
      "source": "Source Concept Name",
      "target": "Target Concept Name",
      "relation": "Description of the relationship (e.g., 'regulates', 'produces')"
    }
  ]
}`;

// Ontology Comparison System Prompt
export const ONTOLOGY_COMPARISON_SYSTEM_PROMPT = `You are an expert systems thinker and qualitative researcher.
Your task is to compare two "Concept Maps" (Ontologies) representing different algorithmic assemblages.

Compare the two provided ontologies (Nodes and Links) to identify:
1. **Conceptual Overlap & Divergence**: Which concepts are shared? Which are unique to each map?
2. **Structural Differences**: How does the topology differ? (e.g., Is one more centralized? Does one focus more on actors vs. mechanisms?)
3. **Relational Shifts**: How are the same concepts related differently in each map?

  Provide your analysis in JSON format:
{
  "summary": "Executive summary of the key differences between the two ontologies (2-3 sentences).",
    "shared_concepts": ["List of concepts present in both"],
      "unique_concepts_source_a": ["Concepts unique to Source A"],
        "unique_concepts_source_b": ["Concepts unique to Source B"],
          "structural_differences": "Analysis of the topological/structural differences.",
            "relationship_divergences": [
              {
                "concept": "Name of the concept involved",
                "difference": "How its relationships differ between the two maps"
              }
            ]
}`;
