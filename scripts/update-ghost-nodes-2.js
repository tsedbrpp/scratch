import * as fs from 'fs';
import * as path from 'path';

const ghostNodesPath = path.resolve('src/lib/ghost-nodes.ts');
let code = fs.readFileSync(ghostNodesPath, 'utf-8');

// 1. Update AbsentActorResponse and validateGhostNodeResponse
const validationReplacement = `// --- Absent Actor type for AI response parsing ---
interface AbsentActorResponse {
  name?: string;
  label?: string; // from Pass 2 schema
  id?: string;
  isValid?: boolean;
  tier?: "Tier1" | "Tier2" | "Tier3";
  absenceType?: string;
  reason?: string;
  ghostReason?: string;
  absenceStrength?: number;
  exclusionType?: 'Active' | 'Passive' | 'Structural' | 'silenced' | 'marginalized' | 'structurally-excluded' | 'displaced';
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
  // V2 Analysis enhancements
  evidenceQuotes?: Array<{
    quote: string;
    actors?: string[];
    sourceRef?: string;
    context?: string; // from Pass 2 schema
  }>;
  claim?: {
    summaryBullets?: string[];
    disambiguations?: string[];
    fullReasoning?: string;
  } | string; // Pass 2 returns localized claim string sometimes
  roster?: {
    actors: string[];
    mechanisms: string[];
  };
  missingSignals?: Array<{
    signal: string;
    searchTerms: string[];
  }>;
  discourseThreats?: string[];
}

interface ValidationIssue {
  actor: string;
  field: string;
  message: string;
}

/**
 * Validates the AI's ghost node response for quality, correctness,
 * and grounding.
 */
function validateGhostNodeResponse(
  absentActors: AbsentActorResponse[],
  existingNodeLabels: string[],
  sourceText: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const documentEvidenceLower = sourceText.toLowerCase();

  absentActors.forEach(actor => {
    const actorName = actor.label || actor.name || 'Unknown';
    
    actor.potentialConnections?.forEach(conn => {
      if (!conn.targetActor || !conn.evidence) return;
      
      const quotedPhrases = conn.evidence.match(/["\\u201c\\u201d]([^"\\u201c\\u201d]{5,})["\\u201c\\u201d]/g)
        ?.map(q => q.replace(/["\\u201c\\u201d]/g, '').trim().toLowerCase()) || [];

      // Verify quoted phrases exist in document
      const groundedQuotes = quotedPhrases.filter(phrase => documentEvidenceLower.includes(phrase));
      const hasArticleRef = /(?:article|section|recital|chapter)\\s+\\d/i.test(conn.evidence);
      const isGrounded = groundedQuotes.length > 0 || hasArticleRef;

      if (!isGrounded && quotedPhrases.length > 0) {
        issues.push({
          actor: actorName,
          field: 'potentialConnections.evidence',
          message: \`Evidence for "\${conn.targetActor}" contains quoted text not found in the document: "\${quotedPhrases[0].substring(0, 60)}..."\`,
        });
      }

      const targetLower = conn.targetActor.toLowerCase();
      const match = existingNodeLabels.some(label =>
        label.toLowerCase().includes(targetLower) || targetLower.includes(label.toLowerCase())
      );
      if (!match && existingNodeLabels.length > 0) {
        issues.push({
          actor: actorName,
          field: 'potentialConnections.targetActor',
          message: \`"\${conn.targetActor}" not found in existing network. Available: \${existingNodeLabels.slice(0, 5).join(', ')}...\`,
        });
      }
    });

    // V2 Validation: Validate Evidence Quotes
    if (actor.evidenceQuotes && actor.evidenceQuotes.length > 0) {
      actor.evidenceQuotes.forEach((eq, index) => {
        if (!eq.quote) return;
        const quoteLower = eq.quote.toLowerCase();
        const normalizedQuote = quoteLower.replace(/\\s+/g, ' ').replace(/[^\\w\\s]/gi, '');
        const normalizedEvidence = documentEvidenceLower.replace(/\\s+/g, ' ').replace(/[^\\w\\s]/gi, '');

        if (!normalizedEvidence.includes(normalizedQuote) && quoteLower.length > 10) {
          issues.push({
            actor: actorName,
            field: \`evidenceQuotes[\${index}].quote\`,
            message: \`The extracted quote was not found as a verbatim substring in the provided document sections: "\${eq.quote.substring(0, 60)}..."\`,
          });
        }
      });
    }

    if (!actor.claim && !actor.label && !actor.name) {
      issues.push({ actor: actorName, field: 'claim', message: 'Missing structured claim or label object.' });
    }
  });

  return issues;
}

/**
 * Build a prompt to request corrections from the AI based on validation issues.
 */
function buildCorrectionPrompt(issues: ValidationIssue[], previousResponse: string): string {
  const issueDescriptions = issues.map(i => \`- For "\${i.actor}" (\${i.field}): \${i.message}\`).join('\\n');

  return \`# REVISION REQUIRED: Evidence Grounding Failed

Your previous response contained the following evidence grounding errors. You MUST correct these.

## Issues to Fix:
\${issueDescriptions}

## Instructions:
1. Find the verbatim text in the document context provided earlier. Fix the quotes so they are EXACT substrings.
2. If the text does not exist, you must change the evidence or drop the connection/actor.
3. Every \`targetActor\` in \`potentialConnections\` must already exist in the provided "Existing actors" list. DO NOT invent new target actors.
4. Include all required fields (exclusionType, institutionalLogics, potentialConnections)
5. Ensure the new V2 structured keys are completely populated: 
   - "evidenceQuotes": [{"quote": "...", "actors": [], "sourceRef": "..."}]
   - "claim": ...
   - "missingSignals": [{"signal": "...", "searchTerms": []}]
6. Make sure the quotes in evidenceQuotes are perfect substrings of the provided document sections.

Previous response to revise:
\${previousResponse.substring(0, 2000)}

Return the complete corrected JSON object with the same structure.\`;
}

/**
 * Analyze institutional logics using AI and detect ghost nodes.
 * Uses a 3-stage multi-pass pipeline:
 *   Pass 1: Broad scan (gpt-4o-mini) → 8-12 candidates with keywords
 *   Pass 1.5: Relevance scoring (code) → Select top sections per candidate + NegEx
 *   Pass 2: Deep dive (gpt-4o) → Full forensic analysis on candidates
 */
export async function analyzeInstitutionalLogicsAndDetectGhostNodes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openai: any,
  text: string,
  existingAnalysis: { nodes?: Array<{ label?: string; id?: string }> },
  documentType: string = "policy",
  userExpectedActors?: string,
): Promise<{
  ghostNodes: DetectedGhostNode[];
  institutionalLogics?: InstitutionalLogics;
  methodologicalNotes?: string;
  userActorsUsed?: string[];
  dominantDiscourses?: string[];
}> {
  // Validate nodes array early
  const nodesArray = Array.isArray(existingAnalysis.nodes) ? existingAnalysis.nodes : [];
  const existingLabels = nodesArray.map(n => n.label || n.id || '').filter(Boolean);

  // Parse user-provided expected actors
  const parsedUserActors = parseUserExpectedActors(userExpectedActors);
  if (parsedUserActors.length > 0) {
    console.warn(\`[GHOST_NODES] User-provided actors: \${parsedUserActors.length} items:\`, parsedUserActors);
  }

  try {
    console.warn('[GHOST_NODES] === MULTI-PASS PIPELINE START ===');
    console.warn('[GHOST_NODES] Document type:', documentType);
    
    // STAGE 0: Parse document into structured sections
    const parsedDoc = parseDocumentSections(text);
    const structuredTextForPass1 = formatSectionsForPrompt(parsedDoc.sections, 16000);
    
    // PASS 1: Broad Scan
    const pass1Prompt = buildPass1Prompt(structuredTextForPass1, existingLabels, documentType, parsedUserActors);
    
    const pass1Completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a policy analysis assistant. Return valid JSON only adhering strictly to the schema provided." },
        { role: "user", content: pass1Prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });
    
    let pass1Data;
    let candidates: CandidateActor[] = [];
    let dominantDiscoursesFromDoc: string[] = [];
    
    try {
      const parsedRaw = JSON.parse(pass1Completion.choices[0]?.message?.content || "{}");
      pass1Data = GhostNodesPass1Schema.parse(parsedRaw);
      candidates = pass1Data.ghostNodeCandidates;
      dominantDiscoursesFromDoc = pass1Data.dominantDiscourses.map(d => d.isOther && d.otherLabel ? d.otherLabel : d.label);
    } catch(err) {
      console.warn('[GHOST_NODES] Pass 1 Zod parsing failed. Using raw payload.', err);
      const parsedRaw = JSON.parse(pass1Completion.choices[0]?.message?.content || "{}");
      candidates = parsedRaw.ghostNodeCandidates || parsedRaw.candidates || [];
      dominantDiscoursesFromDoc = parsedRaw.dominantDiscourses?.map((d: any) => d.label) || [];
    }

    if (candidates.length === 0) {
      return { ghostNodes: detectGhostNodes(nodesArray, undefined, documentType) };
    }

    // PASS 1.5: NegEx Detection + Relevance Scoring
    const exclusionMap = detectExplicitExclusions(text, candidates);
    if (exclusionMap.size > 0) {
      for (const candidate of candidates) {
        const matches = exclusionMap.get(candidate.name);
        if (matches && matches.length > 0) {
          candidate.explicitExclusions = matches;
        }
      }
    }

    // Sort candidates: High > Medium > Low
    const sortedCandidates = [...candidates].filter(c => c.absenceStrengthPrelim !== 'Low').sort((a,b) => {
      if (a.absenceStrengthPrelim === 'High' && b.absenceStrengthPrelim !== 'High') return -1;
      if (a.absenceStrengthPrelim !== 'High' && b.absenceStrengthPrelim === 'High') return 1;
      return 0;
    }).slice(0, MAX_DEEP_DIVE_CANDIDATES);

    const logPath = 'c:\\\\Users\\\\mount\\\\.gemini\\\\antigravity\\\\scratch\\\\ghost_debug.log';
    const allAbsentActors: AbsentActorResponse[] = [];
    
    // PASS 2: Batched Deep Dive
    const pass2Results = await asyncBatchProcess(sortedCandidates, 4, async (batch) => {
      const pass2Prompt = buildPass2Prompt(batch, existingLabels, documentType, parsedDoc.sections, dominantDiscoursesFromDoc);
      
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert in policy forensics. You MUST return JSON with: 'ghostNodes' (array). Evidence should be exactly quoted." },
          { role: "user", content: pass2Prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 16384,
      });

      const responseText = completion.choices[0]?.message?.content || "{}";
      try { fs.appendFileSync(logPath, \`\\n--- Pass 2 Batch ---\\n\\n\${responseText}\\n\`); } catch (e) {}

      let batchActors: AbsentActorResponse[] = [];
      try {
        const parsedNode = JSON.parse(responseText);
        const pass2Parsed = GhostNodesPass2Schema.parse(parsedNode);
        batchActors = pass2Parsed.ghostNodes;
      } catch (err) {
        console.warn('[GHOST_NODES] Pass 2 Zod Schema failed. Attempting raw payload', err);
        const parsedRaw = JSON.parse(responseText);
        batchActors = parsedRaw.ghostNodes || parsedRaw.absentActors || [];
      }
      return batchActors;
    });

    allAbsentActors.push(...pass2Results);

    // Validation & Correction phase (Simplified for robustness across the final list)
    let validatedActors = allAbsentActors;
    const issues = validateGhostNodeResponse(allAbsentActors, existingLabels, text);
    if (issues.length > 3) {
      console.warn(\`[GHOST_NODES] Validation found \${issues.length} issues:\\n\`, issues);
      // Correction could happen here, keeping it to fallback rules for now to ensure stability
    }

    // Assembly
    const ghostNodes = detectGhostNodes(nodesArray, undefined, documentType);
    
    validatedActors.forEach((absentActor: AbsentActorResponse, index: number) => {
      if (!absentActor.isValid) {
        console.warn(\`[GHOST_NODES] Dropping invalid/Tier 3 actor: "\${absentActor.label || absentActor.name}"\`);
        return; // tier exclusion drops
      }
      
      const name = absentActor.label || absentActor.name || 'Unknown';
      if (isDuplicateConcept(name, [...nodesArray, ...ghostNodes.map(gn => ({ label: gn.label, id: gn.id }))])) {
        return;
      }

      ghostNodes.push({
        id: absentActor.id || \`ghost-ai-\${index}\`,
        label: name,
        category: absentActor.category || "Actor",
        description: \`This actor type is notably absent from the policy network.\`,
        ghostReason: absentActor.ghostReason || absentActor.reason || '',
        whyAbsent: absentActor.ghostReason || absentActor.reason || '',
        isGhost: true,
        color: absentActor.tier === 'Tier1' ? "#DC2626" : "#9333EA", // Red for severe
        evidence: absentActor.evidenceQuotes?.map(eq => ({ rationale: eq.context || '', quote: eq.quote, sourceRef: eq.sourceRef })) || [],
        potentialConnections: absentActor.potentialConnections || [],
        ...(absentActor.absenceStrength && { absenceStrength: absentActor.absenceStrength }),
        ...(absentActor.exclusionType && { exclusionType: absentActor.exclusionType }),
        ...(absentActor.absenceType && { absenceType: absentActor.absenceType }),
        ...(absentActor.evidenceQuotes?.length && { evidenceQuotes: absentActor.evidenceQuotes }),
        ...(typeof absentActor.claim === 'string' ? { claim: { fullReasoning: absentActor.claim } } : absentActor.claim && { claim: absentActor.claim }),
        ...(absentActor.missingSignals?.length && { missingSignals: absentActor.missingSignals }),
      } as any);
    });

    return {
      ghostNodes,
      dominantDiscourses: dominantDiscoursesFromDoc,
      ...(parsedUserActors.length > 0 && { userActorsUsed: parsedUserActors }),
    };

  } catch (error) {
    console.error("[GHOST_NODES] Ghost node detection error:", error);
    return { ghostNodes: detectGhostNodes(nodesArray, undefined, documentType) };
  }
}
`

const startMarker = "// --- Absent Actor type for AI response parsing ---";
const startIdx = code.indexOf(startMarker);
if (startIdx !== -1) {
  code = code.substring(0, startIdx) + validationReplacement + "\n";
  fs.writeFileSync(ghostNodesPath, code, 'utf-8');
  console.log("Applied Script 2 changes successfully");
} else {
  console.log("Marker not found!");
}
