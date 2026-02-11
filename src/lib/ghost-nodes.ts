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
  const existingLabels = new Set(existingNodes.map((n) => n.label.toLowerCase()));

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
