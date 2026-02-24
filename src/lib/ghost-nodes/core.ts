import * as fs from 'fs';
import {
    DetectedGhostNode,
    InstitutionalLogics,
    CandidateActor,
    AbsentActorResponse
} from './types';
import { GhostNodesPass1Schema, GhostNodesPass2Schema } from './schemas';
import { DISCOURSE_TAXONOMY } from './constants';
import { parseDocumentSections, formatSectionsForPrompt } from './parser';
import { detectExplicitExclusions } from './negex';
import { buildPass1Prompt, buildPass2Prompt } from './prompt-builders';
import { validateGhostNodeResponse } from './validation';
import {
    detectGhostNodes,
    asyncBatchProcess,
    isDuplicateConcept,
    parseUserExpectedActors
} from './utils';

function extractSurroundingContext(fullText: string, quote: string, padding: number = 300): string {
    if (!fullText || !quote) return "Context not available.";

    // Normalize newlines, find the paragraph containing the quote.
    const cleanDoc = fullText.replace(/\r\n/g, '\n');
    let idx = cleanDoc.indexOf(quote);

    if (idx === -1) {
        // try without exact whitespace, and strip leading/trailing ellipses or quotes
        const cleanQuote = quote.replace(/^[\s\.\"\']+/, '').replace(/[\s\.\"\']+$/, '').replace(/\s+/g, ' ').trim();
        const compactDoc = cleanDoc.replace(/\s+/g, ' ');
        idx = compactDoc.indexOf(cleanQuote);
        if (idx !== -1) {
            const start = Math.max(0, idx - padding);
            const end = Math.min(compactDoc.length, idx + cleanQuote.length + padding);
            return "..." + compactDoc.slice(start, end).trim() + "...";
        }
        return "Quote not found exactly in text.";
    }

    // Exact match found. Find previous and next double newline (paragraph bounds)
    const prevPara = cleanDoc.lastIndexOf('\n\n', idx);
    const start = prevPara !== -1 ? prevPara : Math.max(0, idx - padding);

    const nextPara = cleanDoc.indexOf('\n\n', idx + quote.length);
    const end = nextPara !== -1 ? nextPara : Math.min(cleanDoc.length, idx + quote.length + padding);

    return cleanDoc.slice(start, end).trim();
}

const MAX_DEEP_DIVE_CANDIDATES = 12;

/**
 * Pass 0.5: Extract dominant discourses to anchor Pass 2 analysis
 */
export async function extractDominantDiscourses(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    openai: any,
    structuredText: string,
): Promise<string[]> {
    const prompt = `# Extract Dominant Discourses
You are an expert in institutional logics and policy framing.
From the document sections below, identify the **4–6 most dominant discourses**.

Use **only** these labels when possible (pick the closest match):
${DISCOURSE_TAXONOMY.join('\n- ')}

If none fit well, use "Other: [very brief 3–5 word label]".

For each, give:
- label
- strength (0.0–1.0)
- 1 short evidence quote

Return ONLY JSON:
{
  "dominantDiscourses": [
    {"label": "...", "strength": 0.75, "evidenceQuote": "..."}
  ]
}

Document sections:
${structuredText.substring(0, 8000)}
`;

    try {
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 400,
        });
        const parsed = JSON.parse(res.choices[0].message.content);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const labels = parsed.dominantDiscourses?.map((d: any) => d.label) || [];
        console.warn('[GHOST_NODES] Pass 0.5 extracted discourses:', labels);
        // Fallback if too few or empty
        return labels.length >= 2 ? labels : [...DISCOURSE_TAXONOMY.slice(0, 4)];
    } catch (_) {
        console.warn('[GHOST_NODES] Pass 0.5 failed, using fallback:');
        return [...DISCOURSE_TAXONOMY.slice(0, 4)];
    }
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
    userId?: string
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
        console.warn(`[GHOST_NODES] User-provided actors: ${parsedUserActors.length} items:`, parsedUserActors);
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dominantDiscoursesFromDoc = pass1Data.dominantDiscourses.map((d: any) => d.isOther && d.otherLabel ? d.otherLabel : d.label);
        } catch (err) {
            console.warn('[GHOST_NODES] Pass 1 Zod parsing failed. Using raw payload.', err);
            const parsedRaw = JSON.parse(pass1Completion.choices[0]?.message?.content || "{}");
            candidates = parsedRaw.ghostNodeCandidates || parsedRaw.candidates || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const sortedCandidates = [...candidates].filter(c => c.absenceStrengthPrelim !== 'Low').sort((a, b) => {
            if (a.absenceStrengthPrelim === 'High' && b.absenceStrengthPrelim !== 'High') return -1;
            if (a.absenceStrengthPrelim !== 'High' && b.absenceStrengthPrelim === 'High') return 1;
            return 0;
        }).slice(0, MAX_DEEP_DIVE_CANDIDATES);

        const logPath = 'c:\\Users\\mount\\.gemini\\antigravity\\scratch\\ghost_debug.log';
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
                max_completion_tokens: 16384,
            });

            const responseText = completion.choices[0]?.message?.content || "{}";
            try { fs.appendFileSync(logPath, `\n--- Pass 2 Batch ---\n\n${responseText}\n`); } catch (_) { }

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
        const validatedActors = allAbsentActors;
        const issues = validateGhostNodeResponse(allAbsentActors, existingLabels, text);
        if (issues.length > 3) {
            console.warn(`[GHOST_NODES] Validation found ${issues.length} issues:\n`, issues);
            // Correction could happen here, keeping it to fallback rules for now to ensure stability
        }

        // Assembly
        const ghostNodes = detectGhostNodes(nodesArray, undefined, documentType);

        validatedActors.forEach((absentActor: AbsentActorResponse, index: number) => {
            if (!absentActor.isValid) {
                console.warn(`[GHOST_NODES] Dropping invalid/Tier 3 actor: "${absentActor.label || absentActor.name}"`);
                return; // tier exclusion drops
            }

            const name = absentActor.label || absentActor.name || 'Unknown';
            if (isDuplicateConcept(name, [...nodesArray, ...ghostNodes.map(gn => ({ label: gn.label, id: gn.id }))])) {
                return;
            }

            ghostNodes.push({
                id: absentActor.id || `ghost-ai-${index}`,
                label: name,
                category: absentActor.category || "Actor",
                description: `This actor type is notably absent from the policy network.`,
                ghostReason: absentActor.ghostReason || absentActor.reason || '',
                whyAbsent: absentActor.ghostReason || absentActor.reason || '',
                isGhost: true,
                color: absentActor.tier === 'Tier1' ? "#DC2626" : "#9333EA", // Red for severe
                evidence: absentActor.evidenceQuotes?.map(eq => ({ rationale: eq.context || '', quote: eq.quote, sourceRef: eq.sourceRef })) || [],
                potentialConnections: absentActor.potentialConnections || [],
                ...(absentActor.absenceStrength && { absenceStrength: absentActor.absenceStrength }),
                ...(absentActor.exclusionType && { exclusionType: absentActor.exclusionType }),
                ...(absentActor.absenceType && { absenceType: absentActor.absenceType }),
                ...(absentActor.evidenceQuotes?.length && {
                    evidenceQuotes: absentActor.evidenceQuotes.map(eq => ({
                        ...eq,
                        context: extractSurroundingContext(text, eq.quote)
                    }))
                }),
                ...(typeof absentActor.claim === 'string' ? { claim: { fullReasoning: absentActor.claim } } : absentActor.claim && { claim: absentActor.claim }),
                ...(absentActor.missingSignals?.length && { missingSignals: absentActor.missingSignals }),
                ...(absentActor.roster && { roster: absentActor.roster }),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
        });

        // Execute Structural Concern Analysis for each Ghost Node
        if (userId) {
            console.log(`[GHOST_NODES] Running Structural Concern Analysis on ${ghostNodes.length} ghost nodes...`);
            try {
                const { StructuralConcernService } = await import('@/lib/structural-concern-service');
                await Promise.all(ghostNodes.map(async (gn) => {
                    if (gn.evidenceQuotes && gn.evidenceQuotes.length > 0) {
                        try {
                            const excerpts = gn.evidenceQuotes.map((eq: any, i: number) => ({
                                id: `eq-${i}`,
                                text: eq.quote,
                                sourceRef: eq.sourceRef
                            }));
                            const structuralResult = await StructuralConcernService.analyzeStructuralConcern(
                                openai,
                                userId,
                                gn.label,
                                documentType,
                                excerpts
                            );
                            gn.structuralAnalysis = structuralResult;
                        } catch (err) {
                            console.warn(`[GHOST_NODES] Failed to generate structural analysis for ${gn.label}`, err);
                        }
                    }
                }));
            } catch (serviceErr) {
                console.warn(`[GHOST_NODES] Failed to import/run StructuralConcernService`, serviceErr);
            }
        }

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
