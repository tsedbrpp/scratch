import { AbsentActorResponse, ValidationIssue } from './types';

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

        // V2 Validation: Validate Evidence Quotes
        if (actor.evidenceQuotes && actor.evidenceQuotes.length > 0) {
            actor.evidenceQuotes.forEach((eq, index) => {
                if (!eq.quote) return;
                const quoteLower = eq.quote.toLowerCase();
                const normalizedQuote = quoteLower.replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');
                const normalizedEvidence = documentEvidenceLower.replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');

                if (!normalizedEvidence.includes(normalizedQuote) && quoteLower.length > 10) {
                    issues.push({
                        actor: actorName,
                        field: `evidenceQuotes[${index}].quote`,
                        message: `The extracted quote was not found as a verbatim substring in the provided document sections: "${eq.quote.substring(0, 60)}..."`,
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
