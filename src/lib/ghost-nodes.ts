/**
 * Ghost Node Detection Utilities
 * Adapted from Ghost Nodes mobile app for InstantTea web platform
 */

/**
 * Calculate semantic similarity between two strings using simple token overlap
 * Returns a score between 0 and 1, where 1 means identical
 */
function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const tokenize = (s: string) => normalize(s).split(/\s+/).filter(t => t.length > 2);
  
  const tokens1 = new Set(tokenize(str1));
  const tokens2 = new Set(tokenize(str2));
  
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  
  const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
  const union = new Set([...tokens1, ...tokens2]);
  
  return intersection.size / union.size;
}

/**
 * Check if a ghost node is semantically similar to any existing node
 */
function isDuplicateConcept(ghostLabel: string, existingNodes: Array<{label?: string; id?: string}>): boolean {
  const SIMILARITY_THRESHOLD = 0.4; // 40% token overlap = duplicate
  
  for (const node of existingNodes) {
    // Check both label and id fields
    const nodeText = node.label || node.id;
    if (!nodeText) continue;
    const similarity = calculateSimilarity(ghostLabel, nodeText);
    if (similarity >= SIMILARITY_THRESHOLD) {
      console.log(`[GHOST_NODES] Filtering duplicate: "${ghostLabel}" matches "${nodeText}" (${(similarity * 100).toFixed(0)}% similar)`);
      return true;
    }
  }
  return false;
}

export interface GhostNode {
  id: string;
  label: string;
  category: string;
  description: string;
  ghostReason: string;
  isGhost: true;
  strength?: number;
  color?: string;
  potentialConnections?: Array<{
    targetActor: string;
    relationshipType: string;
    evidence: string;
  }>;
}

export interface InstitutionalLogics {
  market: {
    strength: number;
    champions: string[];
    material: string;
    discursive: string;
  };
  state: {
    strength: number;
    champions: string[];
    material: string;
    discursive: string;
  };
  professional: {
    strength: number;
    champions: string[];
    material: string;
    discursive: string;
  };
  community: {
    strength: number;
    champions: string[];
    material: string;
    discursive: string;
  };
}

/**
 * Expected actors database by document type
 */
const EXPECTED_ACTORS: Record<string, string[]> = {
  policy: [
    "Civil Society Organizations",
    "Citizens / Public",
    "Academic Researchers",
    "Industry Representatives",
    "Labor Unions",
    "Indigenous Communities",
    "Environmental Groups",
    "Consumer Advocates",
  ],
  regulation: [
    "Regulatory Bodies",
    "Industry Stakeholders",
    "Public Interest Groups",
    "Technical Experts",
    "Affected Communities",
    "International Bodies",
  ],
  governance: [
    "Government Agencies",
    "Private Sector",
    "Civil Society",
    "Technical Community",
    "Academic Institutions",
    "International Organizations",
  ],
  default: [
    "Civil Society",
    "Citizens",
    "Marginalized Communities",
    "Academic Researchers",
    "Public Interest Groups",
  ],
};

/**
 * Detect ghost nodes based on institutional logics analysis
 */
export function detectGhostNodes(
  existingNodes: Array<{ label?: string; id?: string }>,
  institutionalLogics?: InstitutionalLogics,
  documentType: string = "policy",
): GhostNode[] {
  const ghostNodes: GhostNode[] = [];

  // Validate existingNodes is an array
  if (!Array.isArray(existingNodes)) {
    console.warn(
      "detectGhostNodes: existingNodes is not an array",
      existingNodes,
    );
    return ghostNodes;
  }

  // 1. Detect weak institutional logics
  if (institutionalLogics) {
    const logics = [
      {
        name: "Market",
        logic: institutionalLogics.market,
        label: "Market Actors",
        category: "Market Logic",
      },
      {
        name: "State",
        logic: institutionalLogics.state,
        label: "State Actors",
        category: "State Logic",
      },
      {
        name: "Professional",
        logic: institutionalLogics.professional,
        label: "Professional Expertise",
        category: "Professional Logic",
      },
      {
        name: "Community",
        logic: institutionalLogics.community,
        label: "Community Voice",
        category: "Community Logic",
      },
    ];

    logics.forEach(({ name, logic, label, category }) => {
      if (logic.strength < 0.3 && !isDuplicateConcept(label, existingNodes)) {
        ghostNodes.push({
          id: `ghost-logic-${name.toLowerCase()}`,
          label,
          category,
          description: `${name} institutional logic is weak or absent in this governance structure.`,
          ghostReason: `This logic has a strength of ${logic.strength.toFixed(
            2,
          )}, indicating minimal ${name.toLowerCase()} influence in the policy network. ${
            logic.champions.length === 0
              ? "No clear champions identified."
              : `Champions: ${logic.champions.join(", ")}`
          }`,
          isGhost: true,
          strength: logic.strength,
          color: getCategoryColor(category),
        });
      }
    });
  }

  // 2. Detect missing expected actors
  const expectedActors =
    EXPECTED_ACTORS[documentType] || EXPECTED_ACTORS["default"];

  expectedActors.forEach((expectedActor, index) => {
    const normalizedExpected = expectedActor.toLowerCase();
    const isPresent = existingNodes.some((node) => {
      if (!node || !node.label) return false;
      const label = node.label.toLowerCase();
      return (
        label.includes(normalizedExpected) ||
        normalizedExpected.includes(label) ||
        (normalizedExpected.includes("civil") && label.includes("ngo")) ||
        (normalizedExpected.includes("citizens") && label.includes("public"))
      );
    });

    if (!isPresent && !isDuplicateConcept(expectedActor, existingNodes)) {
      ghostNodes.push({
        id: `ghost-expected-${index}`,
        label: expectedActor,
        category: "Expected Actor",
        description: `This actor type is typically present in ${documentType} documents but appears to be absent or marginalized.`,
        ghostReason: `${expectedActor} are commonly stakeholders in ${documentType} governance but are not explicitly mentioned or represented in this network. This absence may indicate exclusion, marginalization, or implicit representation.`,
        isGhost: true,
        color: "#9333EA",
      });
    }
  });

  return ghostNodes;
}

/**
 * Get color for node category
 */
export function getCategoryColor(category: string): string {
  const lower = category.toLowerCase();

  if (lower.includes("actor") || lower.includes("stakeholder"))
    return "#3B82F6"; // Blue
  if (lower.includes("concept") || lower.includes("core")) return "#DC2626"; // Red
  if (lower.includes("mechanism") || lower.includes("process"))
    return "#9333EA"; // Purple
  if (lower.includes("value") || lower.includes("principle")) return "#EA580C"; // Orange
  if (lower.includes("state")) return "#2563EB"; // Dark Blue
  if (lower.includes("market")) return "#16A34A"; // Green
  if (lower.includes("professional")) return "#0891B2"; // Cyan
  if (lower.includes("community")) return "#C026D3"; // Magenta
  if (lower.includes("expected")) return "#9333EA"; // Purple

  return "#64748B"; // Slate (default)
}

/**
 * AI prompt for ghost node detection
 */
export function getGhostNodePrompt(): string {
  return `You are analyzing a policy document to identify actors, concepts, and relationships, with special attention to ABSENT or MARGINALIZED voices.

Your task:
1. Extract all explicitly mentioned actors, concepts, mechanisms, and values
2. Identify INSTITUTIONAL LOGICS present (Market, State, Professional, Community)
3. For each logic, assess its strength (0-1 scale) and identify champions

Return JSON with this structure:
{
  "summary": "Brief overview of the policy network",
  "nodes": [
    {
      "id": "unique-id",
      "label": "Actor/Concept Name",
      "category": "Actor|Concept|Mechanism|Value",
      "description": "What this node represents",
      "quote": "Supporting quote from document"
    }
  ],
  "links": [
    {
      "source": "node-id",
      "target": "node-id",
      "relation": "relationship type"
    }
  ],
  "institutionalLogics": {
    "market": {
      "strength": 0.0-1.0,
      "champions": ["Actor names"],
      "material": "Material practices",
      "discursive": "Discourse patterns"
    },
    "state": { "strength": 0.0-1.0, "champions": [], "material": "", "discursive": "" },
    "professional": { "strength": 0.0-1.0, "champions": [], "material": "", "discursive": "" },
    "community": { "strength": 0.0-1.0, "champions": [], "material": "", "discursive": "" }
  }
}

Focus on:
- Who has voice vs who is silent
- Which logics dominate vs which are weak
- Power asymmetries and exclusions`;
}

/**
 * Analyze institutional logics using AI and detect ghost nodes
 */
export async function analyzeInstitutionalLogicsAndDetectGhostNodes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openai: any,
  text: string,
  existingAnalysis: { nodes?: Array<{ label?: string; id?: string }> },
  documentType: string = "policy",
): Promise<{
  ghostNodes: GhostNode[];
  institutionalLogics?: InstitutionalLogics;
}> {
  try {
    // Call OpenAI to analyze institutional logics and ghost nodes
    const prompt = `Analyze the following policy document to identify institutional logics and ABSENT/MARGINALIZED actors.

Document Text:
${text.substring(0, 3000)}

Existing Network Analysis:
${JSON.stringify(existingAnalysis, null, 2).substring(0, 1000)}

Return ONLY a JSON object with this structure:
{
  "institutionalLogics": {
    "market": {
      "strength": 0.8,
      "champions": ["Big Tech Companies", "Private Sector"],
      "material": "Profit-driven data center expansion",
      "discursive": "Efficiency and innovation rhetoric"
    },
    "state": {
      "strength": 0.5,
      "champions": ["Federal Agencies", "State Governments"],
      "material": "Regulatory oversight mechanisms",
      "discursive": "Public interest protection"
    },
    "professional": {
      "strength": 0.3,
      "champions": [],
      "material": "",
      "discursive": ""
    },
    "community": {
      "strength": 0.1,
      "champions": [],
      "material": "",
      "discursive": ""
    }
  },
  "absentActors": [
    {
      "name": "Indigenous Communities",
      "reason": "The document focuses exclusively on technical infrastructure and industry compliance without addressing Indigenous land rights or traditional knowledge systems.",
      "absenceStrength": 85,
      "exclusionType": "structurally-excluded",
      "institutionalLogics": {
        "market": 0.1,
        "state": 0.2,
        "professional": 0.1,
        "community": 0.9
      },
      "potentialConnections": [
        {
          "targetActor": "Local Communities",
          "relationshipType": "excluded from",
          "evidence": "The regulatory framework establishes industry-led processes without requiring consultation with Indigenous stakeholders."
        }
      ]
    }
  ]
}

For absentActors - CRITICAL REQUIREMENTS:
1. Identify 3-5 actor types typically present in ${documentType} governance but ABSENT here
2. Explain WHY they're absent based on THIS SPECIFIC document:
   - Reference the document's actual focus, scope, or framing
   - Mention what the document prioritizes INSTEAD of this actor
   - Be analytical, not generic (bad: "commonly stakeholders", good: "The regulatory framework prioritizes industry compliance without addressing community consultation processes")
3. For EACH absent actor, provide absenceStrength (0-100):
   - 0-30: Weakly absent (mentioned peripherally, minor exclusion)
   - 31-60: Moderately absent (some relevance but not enrolled)
   - 61-85: Strongly absent (highly relevant but systematically excluded)
   - 86-100: Critically absent (essential actor completely missing, major political consequence)
4. For EACH absent actor, classify exclusionType:
   - "silenced": Mentioned in document but not enrolled as active participant
   - "marginalized": Present but with weak connections or peripheral role
   - "structurally-excluded": Never considered due to document framing/scope
   - "displaced": Replaced by proxy actors (e.g., "industry reps" instead of "workers")
5. For EACH absent actor, provide institutionalLogics (0.0-1.0 for each logic):
   - Shows which institutional logic this absent actor would champion if enrolled
   - Example: Indigenous Communities = {community: 0.9, state: 0.2, professional: 0.1, market: 0.1}
6. For EACH absent actor, you MUST provide 1-3 potentialConnections:
   - targetActor: Use the EXACT name of an actor from the existing network (check the Existing Network Analysis above)
   - relationshipType: Choose ONE: "excluded from" | "silenced by" | "addressed but not enrolled" | "marginalized by"
   - evidence: Extract a direct quote or paraphrase showing the exclusion (1-2 sentences max)
4. Example of a GOOD absent actor:
   {
     "name": "Indigenous Communities",
     "reason": "The document focuses exclusively on technical infrastructure standards and industry compliance mechanisms, without addressing Indigenous land rights or traditional knowledge systems in the governance structure.",
     "potentialConnections": [
       {
         "targetActor": "Regulatory Authority",
         "relationshipType": "excluded from",
         "evidence": "The regulatory framework establishes industry-led compliance processes without requiring consultation with Indigenous stakeholders."
       }
     ]
   }

Strength assessment (use decimal values between 0.0 and 1.0):
- 0.0 to 0.3: Weak or absent logic
- 0.3 to 0.6: Moderate presence
- 0.6 to 1.0: Strong dominance`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in institutional theory and policy analysis. Analyze documents to identify institutional logics.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    console.log('[GHOST_NODES] AI raw response:', responseText.substring(0, 500));
    const result = JSON.parse(responseText);
    console.log('[GHOST_NODES] Parsed result keys:', Object.keys(result));
    console.log('[GHOST_NODES] absentActors count:', result.absentActors?.length || 0);

    // Validate nodes array
    const nodesArray = Array.isArray(existingAnalysis.nodes)
      ? existingAnalysis.nodes
      : [];

    console.log(
      "[GHOST_NODES] Detecting ghost nodes for",
      nodesArray.length,
      "existing nodes",
    );

    // Detect ghost nodes using the institutional logics
    const ghostNodes = detectGhostNodes(
      nodesArray,
      result.institutionalLogics,
      documentType,
    );

    // Replace generic absent actor explanations with AI-generated ones
    console.log('[GHOST_NODES] AI returned', result.absentActors?.length || 0, 'absent actors');
    
    if (result.absentActors && Array.isArray(result.absentActors)) {
      result.absentActors.forEach(
        (
          absentActor: {
            name: string;
            reason: string;
            absenceStrength?: number;
            exclusionType?: 'silenced' | 'marginalized' | 'structurally-excluded' | 'displaced';
            institutionalLogics?: {
              market: number;
              state: number;
              professional: number;
              community: number;
            };
            potentialConnections?: Array<{
              targetActor: string;
              relationshipType: string;
              evidence: string;
            }>;
          },
          index: number,
        ) => {
          // Check for duplicates with existing nodes AND already-added ghost nodes
          const allNodes = [...nodesArray, ...ghostNodes.map(gn => ({ label: gn.label, id: gn.id }))];
          if (isDuplicateConcept(absentActor.name, allNodes)) {
            console.log(`[GHOST_NODES] Filtering duplicate: "${absentActor.name}" matches existing node or ghost`);
            return;
          }
          
          const ghostNodeIndex = ghostNodes.findIndex(
            (gn) =>
              gn.label.toLowerCase().includes(absentActor.name.toLowerCase()) ||
              absentActor.name.toLowerCase().includes(gn.label.toLowerCase()),
          );

          if (ghostNodeIndex !== -1) {
            // Update existing ghost node with AI explanation and connections
            console.log(`[GHOST_NODES] Updating ghost node "${ghostNodes[ghostNodeIndex].label}" with AI data`);
            ghostNodes[ghostNodeIndex].ghostReason = absentActor.reason;
            ghostNodes[ghostNodeIndex].potentialConnections =
              absentActor.potentialConnections || [];
            if (absentActor.absenceStrength !== undefined) {
              (ghostNodes[ghostNodeIndex] as any).absenceStrength = absentActor.absenceStrength;
            }
            if (absentActor.exclusionType) {
              (ghostNodes[ghostNodeIndex] as any).exclusionType = absentActor.exclusionType;
            }
            if (absentActor.institutionalLogics) {
              (ghostNodes[ghostNodeIndex] as any).institutionalLogics = absentActor.institutionalLogics;
            }
            console.log(`[GHOST_NODES] Added ${absentActor.potentialConnections?.length || 0} potential connections`);
          } else {
            // Add new ghost node from AI analysis
            console.log(`[GHOST_NODES] Adding new AI ghost node: "${absentActor.name}"`);
            ghostNodes.push({
              id: `ghost-ai-${index}`,
              label: absentActor.name,
              category: "Expected Actor",
              description: `This actor type is notably absent from the policy network.`,
              ghostReason: absentActor.reason,
              isGhost: true,
              color: "#9333EA",
              potentialConnections: absentActor.potentialConnections || [],
              ...(absentActor.absenceStrength !== undefined && { absenceStrength: absentActor.absenceStrength }),
              ...(absentActor.exclusionType && { exclusionType: absentActor.exclusionType }),
              ...(absentActor.institutionalLogics && { institutionalLogics: absentActor.institutionalLogics }),
            } as any);
            console.log(`[GHOST_NODES] Added ${absentActor.potentialConnections?.length || 0} potential connections`);
          }
        },
      );
    }

    return {
      ghostNodes,
      institutionalLogics: result.institutionalLogics,
    };
  } catch (error) {
    console.error("[GHOST_NODES] Ghost node detection error:", error);
    console.error("[GHOST_NODES] Error details:", JSON.stringify(error, null, 2));
    // Fallback: detect ghost nodes without AI analysis
    const nodesArray = Array.isArray(existingAnalysis.nodes)
      ? existingAnalysis.nodes
      : [];
    const ghostNodes = detectGhostNodes(nodesArray, undefined, documentType);
    return { ghostNodes };
  }
}
