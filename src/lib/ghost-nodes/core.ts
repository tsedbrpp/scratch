import * as fs from 'fs';
import {
    DetectedGhostNode,
    InstitutionalLogics,
    CandidateActor,
    AbsentActorResponse,
    FormalActor,
    AffectedClaim,
    ObligatoryPassagePoint
} from './types';
import { GhostNodesPass1Schema, GhostNodesPass1ASchema, GhostNodesPass1BSchema, GhostNodesPass2Schema, GhostNodesPass3Schema } from './schemas';
import { DISCOURSE_TAXONOMY } from './constants';
import { parseDocumentSections, formatSectionsForPrompt } from './parser';
import { detectExplicitExclusions } from './negex';
import { buildPass1Prompt, buildPass2Prompt, buildPass1APrompt, buildPass1BPrompt, buildGndpPass2Prompt, buildPass3Prompt } from './prompt-builders';
import { normalizeCounterfactualResult } from './normalizeCounterfactual';
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
            max_completion_tokens: 400,
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
 * Uses the GNDP v1.0 multi-pass pipeline:
 *   Pass 1A: Extraction-only (gpt-4o-mini) → FormalActors, AffectedClaims, OPPs
 *   Pass 1B: Candidate synthesis (gpt-4o-mini) → 8-10 candidates with GNDP fields
 *   Pass 1.5: NegEx detection (code) → Explicit exclusion matching
 *   Pass 2: Deep dive (gpt-4o) → Evidence grading, typology, weighted scoring
 *   Pass 3: Counterfactual power test (gpt-4o) → Quarantined speculation for top 6
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
        console.warn('[GHOST_NODES] === GNDP v1.0 MULTI-PASS PIPELINE START ===');
        console.warn('[GHOST_NODES] Document type:', documentType);

        // STAGE 0: Parse document into structured sections
        const parsedDoc = parseDocumentSections(text);
        const structuredTextForPass1 = formatSectionsForPrompt(parsedDoc.sections, 16000);

        // ============================================================
        // PASS 1A: EXTRACTION ONLY (FormalActors, AffectedClaims, OPPs)
        // ============================================================
        console.warn('[GHOST_NODES] Pass 1A: Structural extraction...');
        const pass1APrompt = buildPass1APrompt(structuredTextForPass1);

        const pass1ACompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a policy analyst. Extract factual data only. Return minified JSON." },
                { role: "user", content: pass1APrompt },
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 4000,
        });

        let formalActors: FormalActor[] = [];
        let affectedClaims: AffectedClaim[] = [];
        let opps: ObligatoryPassagePoint[] = [];

        try {
            const raw1A = JSON.parse(pass1ACompletion.choices[0]?.message?.content || "{}");
            const parsed1A = GhostNodesPass1ASchema.parse(raw1A);
            formalActors = parsed1A.formalActors;
            affectedClaims = parsed1A.affectedClaims;
            opps = parsed1A.obligatoryPassagePoints;
        } catch (err) {
            console.warn('[GHOST_NODES] Pass 1A Zod parsing failed. Using raw payload.', err);
            const raw1A = JSON.parse(pass1ACompletion.choices[0]?.message?.content || "{}");
            formalActors = raw1A.formalActors || [];
            affectedClaims = raw1A.affectedClaims || [];
            opps = raw1A.obligatoryPassagePoints || [];
        }

        console.warn(`[GHOST_NODES] Pass 1A complete: ${formalActors.length} formal actors, ${affectedClaims.length} affected claims, ${opps.length} OPPs`);

        // ============================================================
        // PASS 0.5: Extract dominant discourses (unchanged)
        // ============================================================
        const dominantDiscoursesFromDoc = await extractDominantDiscourses(openai, structuredTextForPass1);

        // ============================================================
        // PASS 1B: CANDIDATE SYNTHESIS VIA SUBTRACTION
        // ============================================================
        console.warn('[GHOST_NODES] Pass 1B: Candidate synthesis via subtraction...');
        const pass1BPrompt = buildPass1BPrompt(formalActors, affectedClaims, opps, existingLabels, documentType);

        const pass1BCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a governance gap analyst. Return minified JSON only." },
                { role: "user", content: pass1BPrompt },
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 4000,
        });

        let candidates: CandidateActor[] = [];

        try {
            const raw1B = JSON.parse(pass1BCompletion.choices[0]?.message?.content || "{}");
            const parsed1B = GhostNodesPass1BSchema.parse(raw1B);
            // Map Pass 1B candidates to CandidateActor format (with GNDP fields)
            candidates = parsed1B.candidates.map(c => ({
                name: c.name,
                reason: c.reason,
                absenceStrengthPrelim: c.preliminaryAbsenceStrength,
                evidencePackets: c.evidencePackets,
                keywords: c.keywords,
                // GNDP Phase 1 fields
                materialImpact: c.materialImpact,
                oppAccess: c.oppAccess,
                sanctionPower: c.sanctionPower,
                dataVisibility: c.dataVisibility,
                representationType: c.representationType,
            }));
        } catch (err) {
            console.warn('[GHOST_NODES] Pass 1B Zod parsing failed. Using raw payload.', err);
            const raw1B = JSON.parse(pass1BCompletion.choices[0]?.message?.content || "{}");
            candidates = (raw1B.candidates || []).map((c: any) => ({
                name: c.name || '',
                reason: c.reason || '',
                absenceStrengthPrelim: c.preliminaryAbsenceStrength || 'Medium',
                evidencePackets: c.evidencePackets,
                keywords: c.keywords || [],
                materialImpact: c.materialImpact,
                oppAccess: c.oppAccess,
                sanctionPower: c.sanctionPower,
                dataVisibility: c.dataVisibility,
                representationType: c.representationType,
            }));
        }

        console.warn(`[GHOST_NODES] Pass 1B complete: ${candidates.length} candidates synthesized`);

        if (candidates.length === 0) {
            return { ghostNodes: detectGhostNodes(nodesArray, undefined, documentType), dominantDiscourses: dominantDiscoursesFromDoc };
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

        // Filter out Low candidates (per GNDP: post-1B pruning)
        const sortedCandidates = [...candidates].filter(c => c.absenceStrengthPrelim !== 'Low').sort((a, b) => {
            if (a.absenceStrengthPrelim === 'High' && b.absenceStrengthPrelim !== 'High') return -1;
            if (a.absenceStrengthPrelim !== 'High' && b.absenceStrengthPrelim === 'High') return 1;
            return 0;
        }).slice(0, MAX_DEEP_DIVE_CANDIDATES);

        console.warn(`[GHOST_NODES] Post-filter: ${sortedCandidates.length} candidates sent to Pass 2`);
        const logPath = 'c:\\Users\\mount\\.gemini\\antigravity\\scratch\\ghost_debug.log';
        const allAbsentActors: AbsentActorResponse[] = [];

        // ============================================================
        // PASS 2: Deep Dive with GNDP evidence grading + typology
        // ============================================================
        console.warn('[GHOST_NODES] Pass 2: GNDP deep dive with evidence grading...');
        const pass2Results = await asyncBatchProcess(sortedCandidates, 4, async (batch) => {
            const pass2Prompt = buildGndpPass2Prompt(batch, existingLabels, parsedDoc.sections, dominantDiscoursesFromDoc);

            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4o",
                messages: [
                    { role: "system", content: "You are an expert in policy forensics using GNDP v1.0. Return minified JSON with 'ghostNodes' array. Apply evidence grade gate: E1/E2 → absenceScore null, ghostType null, isValid false." },
                    { role: "user", content: pass2Prompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.3,
                max_completion_tokens: 16384,
            });

            const responseText = completion.choices[0]?.message?.content || "{}";
            try { fs.appendFileSync(logPath, `\n--- Pass 2 GNDP Batch ---\n\n${responseText}\n`); } catch (_) { }

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
            // GNDP: Drop actors only if genuinely unsupported.
            // Evidence grade overrides tier — if LLM found E3/E4 evidence, keep the actor
            // even if the LLM contradictorily set tier=Tier3 or isValid=false.
            const hasStrongEvidence = absentActor.evidenceGrade === 'E3' || absentActor.evidenceGrade === 'E4';
            if (!hasStrongEvidence && (absentActor.tier === 'Tier3' || (!absentActor.isValid && !absentActor.evidenceGrade))) {
                console.warn(`[GHOST_NODES] Dropping invalid/Tier 3 actor: "${absentActor.label || absentActor.name}" ` +
                    `[tier=${absentActor.tier}, grade=${absentActor.evidenceGrade}, isValid=${absentActor.isValid}, score=${absentActor.absenceScore}]`);
                return; // tier exclusion drops
            }
            if (hasStrongEvidence && (absentActor.tier === 'Tier3' || !absentActor.isValid)) {
                console.warn(`[GHOST_NODES] Keeping ${absentActor.evidenceGrade}-graded actor despite tier/isValid mismatch: "${absentActor.label || absentActor.name}"`);
            }

            const name = absentActor.label || absentActor.name || 'Unknown';
            if (isDuplicateConcept(name, [...nodesArray, ...ghostNodes.map(gn => ({ label: gn.label, id: gn.id }))])) {
                return;
            }

            // Determine color based on evidence grade + score (GNDP gating)
            const eGrade = absentActor.evidenceGrade;
            const score = absentActor.absenceScore;
            let nodeColor = "#9333EA"; // default purple
            if (eGrade === 'E1' || eGrade === 'E2') {
                nodeColor = "#94A3B8"; // slate gray for insufficient
            } else if (score != null && score >= 70) {
                nodeColor = "#DC2626"; // red for high ghost
            } else if (score != null && score >= 40) {
                nodeColor = "#9333EA"; // purple for medium
            } else {
                nodeColor = "#6B7280"; // gray for low
            }

            ghostNodes.push({
                id: absentActor.id || `ghost-ai-${index}`,
                label: name,
                category: absentActor.category || "Actor",
                description: `This actor type is notably absent from the policy network.`,
                ghostReason: absentActor.ghostReason || absentActor.reason || '',
                whyAbsent: absentActor.ghostReason || absentActor.reason || '',
                isGhost: true,
                color: nodeColor,
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
                // GNDP v1.0 extensions
                ...(absentActor.ghostType && { ghostType: absentActor.ghostType }),
                ...(absentActor.evidenceGrade && { evidenceGrade: absentActor.evidenceGrade }),
                ...(absentActor.absenceScore != null && { absenceScore: absentActor.absenceScore }),
                ...(absentActor.scoreBreakdown && { scoreBreakdown: absentActor.scoreBreakdown }),
                ...(absentActor.materialImpact && { materialImpact: absentActor.materialImpact }),
                ...(absentActor.oppAccess && { oppAccess: absentActor.oppAccess }),
                ...(absentActor.sanctionPower && { sanctionPower: absentActor.sanctionPower }),
                ...(absentActor.dataVisibility && { dataVisibility: absentActor.dataVisibility }),
                ...(absentActor.representationType && { representationType: absentActor.representationType }),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
        });

        // ============================================================
        // PASS 3: COUNTERFACTUAL POWER TEST (Quarantined Speculation)
        // ============================================================
        const validatedGhosts = ghostNodes.filter(gn => gn.evidenceGrade === 'E3' || gn.evidenceGrade === 'E4' || (!gn.evidenceGrade && gn.absenceStrength && gn.absenceStrength >= 36));
        if (validatedGhosts.length > 0) {
            console.warn(`[GHOST_NODES] Pass 3: Counterfactual power test for ${Math.min(validatedGhosts.length, 6)} ghost nodes...`);
            try {
                const pass3Prompt = buildPass3Prompt(validatedGhosts.slice(0, 6), opps);
                const pass3Completion = await openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL || "gpt-4o",
                    messages: [
                        { role: "system", content: "You are a governance scenario analyst. ALL outputs are SPECULATIVE REASONING. Frame every claim as conditional. Return minified JSON only." },
                        { role: "user", content: pass3Prompt },
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.4,
                    max_completion_tokens: 12000,
                });

                try {
                    const raw3 = JSON.parse(pass3Completion.choices[0]?.message?.content || "{}");
                    let counterfactuals;
                    try {
                        const parsed3 = GhostNodesPass3Schema.parse(raw3);
                        counterfactuals = parsed3.counterfactuals;
                    } catch (zodErr: any) {
                        // Fallback: accept raw if Zod strict parse fails (schema evolution)
                        const issues = zodErr?.issues?.slice(0, 3)?.map((i: any) => `${i.path?.join('.')} → ${i.message}`) || [];
                        console.warn('[GHOST_NODES] Pass 3 Zod strict parse failed, using raw payload.', issues.length ? `Issues: ${JSON.stringify(issues)}` : '');
                        counterfactuals = raw3.counterfactuals || [];
                    }
                    // Merge counterfactual results back onto ghost nodes
                    for (const cf of counterfactuals) {
                        const targetGhost = ghostNodes.find(gn => gn.id === cf.actorId);
                        if (targetGhost) {
                            targetGhost.counterfactual = normalizeCounterfactualResult(cf);
                        }
                    }
                    console.warn(`[GHOST_NODES] Pass 3 complete: ${counterfactuals.length} counterfactuals merged`);
                } catch (err) {
                    console.warn('[GHOST_NODES] Pass 3 JSON parsing failed. Skipping counterfactuals.', err);
                }
            } catch (pass3Err) {
                console.warn('[GHOST_NODES] Pass 3 LLM call failed. Skipping counterfactuals.', pass3Err);
            }
        }

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

        console.warn(`[GHOST_NODES] === GNDP v1.0 PIPELINE COMPLETE === ${ghostNodes.length} ghost nodes detected`);

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
