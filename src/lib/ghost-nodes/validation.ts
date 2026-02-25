import { AbsentActorResponse, ValidationIssue } from './types';

/**
 * Trigram-based fuzzy substring matching.
 * Slides a window over `haystack` and returns the best trigram similarity
 * score against `needle`. Threshold of 0.80 catches minor LLM paraphrasing.
 */
function trigrams(s: string): Set<string> {
    const t = new Set<string>();
    for (let i = 0; i <= s.length - 3; i++) t.add(s.substring(i, i + 3));
    return t;
}

function trigramSimilarity(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) return 1;
    if (a.size === 0 || b.size === 0) return 0;
    let intersection = 0;
    for (const t of a) if (b.has(t)) intersection++;
    return intersection / (a.size + b.size - intersection); // Jaccard
}

function bestTrigramSimilarity(needle: string, haystack: string): number {
    if (needle.length < 6) return haystack.includes(needle) ? 1 : 0;
    const needleTri = trigrams(needle);
    const windowMin = Math.max(6, Math.floor(needle.length * 0.7));
    const windowMax = Math.ceil(needle.length * 1.3);
    let best = 0;
    // Slide window across haystack, stepping by 1/4 of needle length for speed
    const step = Math.max(1, Math.floor(needle.length / 4));
    for (let start = 0; start <= haystack.length - windowMin; start += step) {
        const end = Math.min(start + windowMax, haystack.length);
        const slice = haystack.substring(start, end);
        const sim = trigramSimilarity(needleTri, trigrams(slice));
        if (sim > best) best = sim;
        if (best >= 0.95) break; // early exit on near-perfect
    }
    return best;
}
export function validateGhostNodeResponse(
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

            const quotedPhrases = conn.evidence.match(/["\u201c\u201d]([^"\u201c\u201d]{5,})["\u201c\u201d]/g)
                ?.map(q => q.replace(/["\u201c\u201d]/g, '').trim().toLowerCase()) || [];

            // Verify quoted phrases exist in document
            const groundedQuotes = quotedPhrases.filter(phrase => documentEvidenceLower.includes(phrase));
            const hasArticleRef = /(?:article|section|recital|chapter)\s+\d/i.test(conn.evidence);
            const isGrounded = groundedQuotes.length > 0 || hasArticleRef;

            if (!isGrounded && quotedPhrases.length > 0) {
                issues.push({
                    actor: actorName,
                    field: 'potentialConnections.evidence',
                    message: `Evidence for "${conn.targetActor}" contains quoted text not found in the document: "${quotedPhrases[0].substring(0, 60)}..."`,
                });
            }

            const targetLower = conn.targetActor.toLowerCase();
            const match = existingNodeLabels.some(label =>
                label.toLowerCase().includes(targetLower) || targetLower.includes(label.toLowerCase())
            );
            if (!match && existingNodeLabels.length > 0) {
                // Just log but don't strictly halt right now for lenient analysis, UI handles absent connections via trace
                issues.push({
                    actor: actorName,
                    field: 'potentialConnections.targetActor',
                    message: `"${conn.targetActor}" not found in existing network. Available: ${existingNodeLabels.slice(0, 5).join(', ')}...`,
                });
            }
        });

        // V2 Validation: Validate Evidence Quotes with fuzzy matching
        if (actor.evidenceQuotes && actor.evidenceQuotes.length > 0) {
            actor.evidenceQuotes.forEach((eq, index) => {
                if (!eq.quote) return;
                const quoteLower = eq.quote.toLowerCase();
                const normalizedQuote = quoteLower.replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');
                const normalizedEvidence = documentEvidenceLower.replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');

                // Exact substring check first (fast path)
                if (normalizedEvidence.includes(normalizedQuote) || quoteLower.length <= 10) return;

                // Fuzzy match: sliding window trigram similarity
                const similarity = bestTrigramSimilarity(normalizedQuote, normalizedEvidence);
                if (similarity < 0.80) {
                    issues.push({
                        actor: actorName,
                        field: `evidenceQuotes[${index}].quote`,
                        message: `The extracted quote was not found as a verbatim substring in the provided document sections (best match: ${Math.round(similarity * 100)}%): "${eq.quote.substring(0, 60)}..."`,
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

export function buildCorrectionPrompt(issues: ValidationIssue[], previousResponse: string): string {
    const issueDescriptions = issues.map(i => `- For "${i.actor}" (${i.field}): ${i.message}`).join('\n');

    return `# REVISION REQUIRED: Evidence Grounding Failed

Your previous response contained the following evidence grounding errors. You MUST correct these.

## Issues to Fix:
${issueDescriptions}

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
${previousResponse.substring(0, 2000)}

Return the complete corrected JSON object with the same structure.`;
}
