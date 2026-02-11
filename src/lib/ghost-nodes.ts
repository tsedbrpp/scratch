/**
 * Ghost Node Detection Utilities
 * Adapted from Ghost Nodes mobile app for InstantTea web platform
 */

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
  existingNodes: any[],
  institutionalLogics?: InstitutionalLogics,
  documentType: string = "policy"
): GhostNode[] {
  const ghostNodes: GhostNode[] = [];
  
  // Validate existingNodes is an array
  if (!Array.isArray(existingNodes)) {
    console.warn('detectGhostNodes: existingNodes is not an array', existingNodes);
    return ghostNodes;
  }
  
  // Filter out nodes without labels and create lowercase set
  const existingLabels = new Set(
    existingNodes
      .filter(n => n && n.label)
      .map((n) => n.label.toLowerCase())
  );

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
      if (logic.strength < 0.3) {
        ghostNodes.push({
          id: `ghost-logic-${name.toLowerCase()}`,
          label,
          category,
          description: `${name} institutional logic is weak or absent in this governance structure.`,
          ghostReason: `This logic has a strength of ${logic.strength.toFixed(
            2
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
  const expectedActors = EXPECTED_ACTORS[documentType] || EXPECTED_ACTORS["default"];

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

    if (!isPresent) {
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

  if (lower.includes("actor") || lower.includes("stakeholder")) return "#3B82F6"; // Blue
  if (lower.includes("concept") || lower.includes("core")) return "#DC2626"; // Red
  if (lower.includes("mechanism") || lower.includes("process")) return "#9333EA"; // Purple
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
  openai: any,
  text: string,
  existingAnalysis: any,
  documentType: string = "policy"
): Promise<{ ghostNodes: GhostNode[]; institutionalLogics?: InstitutionalLogics }> {
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
      "strength": 0.0-1.0,
      "champions": ["Actor names"],
      "material": "Material practices",
      "discursive": "Discourse patterns"
    },
    "state": { "strength": 0.0-1.0, "champions": [], "material": "", "discursive": "" },
    "professional": { "strength": 0.0-1.0, "champions": [], "material": "", "discursive": "" },
    "community": { "strength": 0.0-1.0, "champions": [], "material": "", "discursive": "" }
  },
  "absentActors": [
    {
      "name": "Actor name (e.g., Indigenous Communities)",
      "reason": "SPECIFIC explanation of why this actor is absent in THIS document's context. Reference the document's focus, scope, or framing. Be concrete and analytical, not generic.",
      "potentialConnections": [
        {
          "targetActor": "Name of existing actor in the network",
          "relationshipType": "excluded from | silenced by | addressed but not enrolled | marginalized by",
          "evidence": "Direct quote or paraphrase from document showing the exclusion (1-2 sentences max)"
        }
      ]
    }
  ]
}

For absentActors:
- Identify 3-5 actor types typically present in ${documentType} governance but ABSENT here
- Explain WHY they're absent based on the document's actual content, framing, and scope
- Be specific: reference the document's focus (e.g., "focuses on technical standards, not community impact")
- For each absent actor, identify 1-3 EXISTING actors they would normally connect to
- Extract quotes showing the exclusion (e.g., "without consulting affected communities", "industry-led process")
- Relationship types: "excluded from" (explicit), "silenced by" (implicit), "addressed but not enrolled" (mentioned but no agency), "marginalized by" (deprioritized)

Strength assessment:
- 0.0-0.3: Weak/absent
- 0.3-0.6: Moderate
- 0.6-1.0: Strong dominance`;

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
    const result = JSON.parse(responseText);

    // Validate nodes array
    const nodesArray = Array.isArray(existingAnalysis.nodes) 
      ? existingAnalysis.nodes 
      : [];
    
    console.log('[GHOST_NODES] Detecting ghost nodes for', nodesArray.length, 'existing nodes');

    // Detect ghost nodes using the institutional logics
    let ghostNodes = detectGhostNodes(
      nodesArray,
      result.institutionalLogics,
      documentType
    );
    
    // Replace generic absent actor explanations with AI-generated ones
    if (result.absentActors && Array.isArray(result.absentActors)) {
      result.absentActors.forEach((absentActor: any, index: number) => {
        const ghostNodeIndex = ghostNodes.findIndex(gn => 
          gn.label.toLowerCase().includes(absentActor.name.toLowerCase()) ||
          absentActor.name.toLowerCase().includes(gn.label.toLowerCase())
        );
        
        if (ghostNodeIndex !== -1) {
          // Update existing ghost node with AI explanation and connections
          ghostNodes[ghostNodeIndex].ghostReason = absentActor.reason;
          ghostNodes[ghostNodeIndex].potentialConnections = absentActor.potentialConnections || [];
        } else {
          // Add new ghost node from AI analysis
          ghostNodes.push({
            id: `ghost-ai-${index}`,
            label: absentActor.name,
            category: "Expected Actor",
            description: `This actor type is notably absent from the policy network.`,
            ghostReason: absentActor.reason,
            isGhost: true,
            color: "#9333EA",
            potentialConnections: absentActor.potentialConnections || [],
          });
        }
      });
    }

    return {
      ghostNodes,
      institutionalLogics: result.institutionalLogics,
    };
  } catch (error) {
    console.error("Ghost node detection error:", error);
    // Fallback: detect ghost nodes without AI analysis
    const nodesArray = Array.isArray(existingAnalysis.nodes) 
      ? existingAnalysis.nodes 
      : [];
    const ghostNodes = detectGhostNodes(nodesArray, undefined, documentType);
    return { ghostNodes };
  }
}
