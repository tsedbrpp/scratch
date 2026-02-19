/**
 * Ghost Node Detection Utilities
 * Adapted from Ghost Nodes mobile app for InstantTea web platform
 */

import { validateGhostNodeResponse, logValidationResults, generateCorrectionPrompt } from './ghost-nodes-validation';

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

  // 1. Logic-based ghost nodes disabled - AI generates all ghost nodes now
  // (Previously detected weak institutional logics, but these lacked rich AI-generated data)
  // if (institutionalLogics) { ... }

  // 2. Expected actor detection disabled - AI generates all ghost nodes now
  // (Previously used EXPECTED_ACTORS list, but these lacked context-specific reasoning)
  // const expectedActors = EXPECTED_ACTORS[documentType] || EXPECTED_ACTORS["default"];
  // expectedActors.forEach(...);

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
    // Enhanced forensic framing prompt with clearer methodology
    const expectedActorsList = EXPECTED_ACTORS[documentType] || EXPECTED_ACTORS["default"];
    const existingActorsList = existingAnalysis.nodes?.map(n => n.label).join(', ') || 'None identified yet';
    
    const prompt = `# ROLE & TASK

You are a policy forensics analyst specializing in Actor-Network Theory and institutional logics. Your task is to identify **STRUCTURAL ABSENCES** - actors who should be present in this policy network but are missing, marginalized, or silenced.

## FORENSIC METHODOLOGY

### Step 1: Institutional Logic Mapping
Analyze the document's dominant institutional logics:
- **Market Logic**: Profit, efficiency, competition, innovation
- **State Logic**: Regulation, public interest, sovereignty, compliance
- **Professional Logic**: Expertise, credentials, technical standards
- **Community Logic**: Participation, solidarity, local knowledge, equity

For each logic, assess:
- **Strength (0.0-1.0)**: How dominant is this logic in the document?
  - 0.0-0.2: Absent or token mention
  - 0.2-0.4: Present but subordinate
  - 0.4-0.6: Significant presence
  - 0.6-0.8: Dominant framing
  - 0.8-1.0: Hegemonic (excludes alternatives)
- **Champions**: Which actors embody this logic?
- **Material Practices**: What concrete mechanisms/procedures reflect this logic?
- **Discursive Patterns**: What language/metaphors signal this logic?

### Step 2: Comparative Absence Detection
Compare the document against three reference frames:

**A. Document Type Norms**
For ${documentType} documents, the following actor types are typically present:
${expectedActorsList.join(', ')}

**B. Existing Network**
The following actors ARE present in this document:
${existingActorsList}

**C. Weak Logic Inference**
If a logic has strength < 0.3, its typical champions are likely absent.

### Step 3: Absence Characterization
For each absent actor, determine:

**Exclusion Type** (choose one):
- **Silenced**: Actively prevented from speaking (e.g., no consultation requirement)
- **Marginalized**: Included but with limited influence (e.g., observer status only)
- **Structurally-Excluded**: Excluded by design (e.g., governance limited to industry)
- **Displaced**: Previously included but removed in this iteration

**Absence Strength (0-100)**:
- 0-30: Weak absence (actor mentioned but underrepresented)
- 30-60: Moderate absence (actor missing from key sections)
- 60-85: Strong absence (actor systematically excluded)
- 85-100: Critical absence (exclusion undermines policy legitimacy)

### Step 4: Counterfactual Connection Mapping
For each absent actor, identify **potential connections** they WOULD have if present:
- Use EXACT actor names from the existing network
- Specify the relationship type (e.g., "would regulate", "would challenge", "would represent")
- Provide VERBATIM EVIDENCE from the document showing where this connection is missing
  - Quote exact text (with quotation marks)
  - Explain what the quote reveals about the absence

---

## DOCUMENT CONTEXT

**Document Type**: ${documentType}
**Document Text** (first 3,000 characters):
\`\`\`
${text.substring(0, 3000)}
\`\`\`

**Existing Network Analysis** (first 1,000 characters):
\`\`\`json
${JSON.stringify(existingAnalysis, null, 2).substring(0, 1000)}
\`\`\`

---

## OUTPUT FORMAT

Return ONLY valid JSON with this structure:

\`\`\`json
{
  "institutionalLogics": {
    "market": {
      "strength": 0.8,
      "champions": ["Big Tech Companies", "Private Sector"],
      "material": "Profit-driven data center expansion, voluntary compliance frameworks",
      "discursive": "Efficiency, innovation, competitiveness rhetoric"
    },
    "state": {
      "strength": 0.5,
      "champions": ["Federal Agencies", "State Governments"],
      "material": "Regulatory oversight mechanisms, enforcement provisions",
      "discursive": "Public interest protection, national security"
    },
    "professional": {
      "strength": 0.3,
      "champions": ["Technical Standards Bodies"],
      "material": "Certification requirements",
      "discursive": "Technical expertise, best practices"
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
      "reason": "The document frames data centers purely as technical infrastructure and economic assets, with no consideration of land rights, traditional knowledge systems, or Indigenous sovereignty. The 'community' logic is nearly absent (strength: 0.1), and no mechanisms exist for Indigenous consultation despite facilities being built on traditional territories.",
      "absenceStrength": 90,
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
          "relationshipType": "would have consultation rights with",
          "evidence": "Article 12 states 'Local communities shall be informed of planned data center developments' but defines 'local communities' exclusively as municipal governments, excluding Indigenous nations. The absence of Indigenous consultation requirements violates established precedents in EU environmental directives."
        }
      ]
    }
  ],
  "methodologicalNotes": "Analysis prioritized actors with community logic affiliation (strength < 0.3) and cross-referenced against EU policy norms for stakeholder inclusion. Evidence quotes are verbatim from document text."
}
\`\`\`

---

## QUALITY REQUIREMENTS

1. **Identify 3-5 absent actors** (not more, to maintain focus on strongest absences)
2. **All fields required** for each absent actor (no null/empty values)
3. **Evidence must be verbatim quotes** from the document (use quotation marks)
4. **Target actors must use EXACT names** from existing network (case-sensitive)
5. **Absence strength must be justified** by the severity of exclusion
6. **Avoid false positives**: Do not flag actors who are genuinely irrelevant to this policy domain
7. **Include methodologicalNotes**: Brief explanation of your analytical approach

---

## CALIBRATION EXAMPLES

**Example 1: Strong Absence (Score: 85)**
- Actor: "Workers & Labor Unions"
- Context: AI deployment regulation that addresses "providers" and "deployers" but never mentions workers
- Justification: Workers are directly affected by AI surveillance/automation but have no voice in governance

**Example 2: Moderate Absence (Score: 55)**
- Actor: "Consumer Advocates"
- Context: Data privacy regulation that includes "data subjects" but no consumer representation in oversight bodies
- Justification: Consumers mentioned but excluded from enforcement mechanisms

**Example 3: Weak Absence (Score: 25)**
- Actor: "Academic Researchers"
- Context: Technical standards document focused on industry implementation
- Justification: Researchers mentioned in advisory capacity but underrepresented in decision-making

---

## AVOID THESE ERRORS

❌ **False Positive**: Flagging "Agricultural Sector" as absent from a document about urban AI surveillance (not relevant)
❌ **Vague Evidence**: "The document doesn't mention workers" (need specific quote)
❌ **Invented Connections**: Linking to actors not in existing network
❌ **Unsupported Scoring**: absenceStrength: 95 without justification
❌ **Logic Mismatch**: Claiming actor has "community: 0.9" logic but is championed by corporations`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in Actor-Network Theory and policy analysis. Return valid JSON with institutionalLogics and absentActors arrays. Always include ALL required fields for each absent actor.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    console.log('[GHOST_NODES] AI raw response:', responseText.substring(0, 500));
    const result = JSON.parse(responseText);
    console.log('[GHOST_NODES] Parsed result keys:', Object.keys(result));
    console.log('[GHOST_NODES] absentActors count:', result.absentActors?.length || 0);
    if (result.absentActors && result.absentActors.length > 0) {
      console.log('[GHOST_NODES] First absent actor fields:', Object.keys(result.absentActors[0]));
      console.log('[GHOST_NODES] First absent actor sample:', JSON.stringify(result.absentActors[0]).substring(0, 300));
    }

    // Validate AI response
    const validationResult = validateGhostNodeResponse(result, existingAnalysis);
    logValidationResults(validationResult);

    // If validation fails with critical errors, attempt one retry with correction prompt
    if (!validationResult.isValid && validationResult.errors.length > 0) {
      console.log('[GHOST_NODES] Validation failed, attempting correction...');
      const correctionPrompt = generateCorrectionPrompt(validationResult);
      
      try {
        const correctionCompletion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert in Actor-Network Theory and policy analysis. Return valid JSON with institutionalLogics and absentActors arrays. Always include ALL required fields for each absent actor.",
            },
            { role: "user", content: prompt },
            { role: "assistant", content: responseText },
            { role: "user", content: correctionPrompt }
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 3000,
        });

        const correctedResponseText = correctionCompletion.choices[0]?.message?.content || "{}";
        const correctedResult = JSON.parse(correctedResponseText);
        
        const correctedValidation = validateGhostNodeResponse(correctedResult, existingAnalysis);
        logValidationResults(correctedValidation);
        
        if (correctedValidation.isValid || correctedValidation.errors.length < validationResult.errors.length) {
          console.log('[GHOST_NODES] Correction improved response, using corrected version');
          Object.assign(result, correctedResult);
        } else {
          console.log('[GHOST_NODES] Correction did not improve response, using original');
        }
      } catch (correctionError) {
        console.error('[GHOST_NODES] Correction attempt failed:', correctionError);
        // Continue with original result
      }
    }

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
            console.log(`[GHOST_NODES]   - absenceStrength: ${absentActor.absenceStrength ?? 'MISSING'}`);
            console.log(`[GHOST_NODES]   - exclusionType: ${absentActor.exclusionType ?? 'MISSING'}`);
            console.log(`[GHOST_NODES]   - institutionalLogics: ${absentActor.institutionalLogics ? 'present' : 'MISSING'}`);
            ghostNodes[ghostNodeIndex].ghostReason = absentActor.reason;
            (ghostNodes[ghostNodeIndex] as any).whyAbsent = absentActor.reason; // New field name
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
            console.log(`[GHOST_NODES]   - absenceStrength: ${absentActor.absenceStrength ?? 'MISSING'}`);
            console.log(`[GHOST_NODES]   - exclusionType: ${absentActor.exclusionType ?? 'MISSING'}`);
            console.log(`[GHOST_NODES]   - institutionalLogics: ${absentActor.institutionalLogics ? 'present' : 'MISSING'}`);
            ghostNodes.push({
              id: `ghost-ai-${index}`,
              label: absentActor.name,
              category: "Expected Actor",
              description: `This actor type is notably absent from the policy network.`,
              ghostReason: absentActor.reason, // Legacy field
              whyAbsent: absentActor.reason, // New field name for UI
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
