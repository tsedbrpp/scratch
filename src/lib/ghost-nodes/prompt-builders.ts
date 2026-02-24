import { CandidateActor, DocumentSection } from './types';
import { EXPECTED_ACTORS, DISCOURSE_TAXONOMY } from './constants';
import { GHOST_NODES_COMBINED_PASS_1_PROMPT, GHOST_NODES_PASS_2_PROMPT } from '../prompts/ghost-nodes';

export function buildPass1Prompt(
    structuredText: string,
    existingLabels: string[],
    documentType: string,
    userExpectedActors?: string[],
): string {
    const expectedActors = EXPECTED_ACTORS[documentType] || EXPECTED_ACTORS["default"];
    const dedupedUserActors = userExpectedActors?.filter(
        ua => !expectedActors.some(ea => ea.toLowerCase() === ua.toLowerCase())
    ) || [];
    const userActorsLine = dedupedUserActors.length > 0
        ? `\n**User-specified expected actors:** ${dedupedUserActors.join(', ')}`
        : '';

    return GHOST_NODES_COMBINED_PASS_1_PROMPT
        .replace('{{DISCOURSE_TAXONOMY}}', DISCOURSE_TAXONOMY.map(t => '- ' + t).join('\n'))
        .replace('{{DOCUMENT_TYPE}}', documentType)
        .replace('{{EXPECTED_ACTORS}}', expectedActors.join(', '))
        .replace('{{USER_ACTORS}}', userActorsLine)
        .replace('{{EXISTING_LABELS}}', existingLabels.length > 0 ? existingLabels.join(', ') : '(none yet)')
        .replace('{{STRUCTURED_TEXT}}', structuredText);
}

export function buildPass2Prompt(
    candidates: CandidateActor[],
    existingLabels: string[],
    documentType: string,
    allSections: DocumentSection[],
    dominantDiscourses: string[] = [],
): string {
    const globalContext = allSections.slice(0, 3).map(s => {
        return s.heading ? `[${s.tag} — ${s.heading}]\n${s.content}` : `[${s.tag}]\n${s.content}`;
    }).join('\n\n');

    const candidateBlocks = candidates.map(c => {
        const packets = c.evidencePackets || [];
        const packetText = packets.map(p => `- Quote: "${p.quote}" (Location: ${p.locationMarker})`).join('\n');
        let exclusionsText = '';
        if (c.explicitExclusions && c.explicitExclusions.length > 0) {
            exclusionsText = `\n**⚠️ Explicit exclusion detected (${c.explicitExclusions[0].confidence}):**\n` +
                c.explicitExclusions.map(e => `- Trigger: "${e.trigger}" → Scope: "...${e.matchedText.slice(0, 120)}..."`).join('\n') +
                `\nVerify this exclusion.\n`;
        }
        return `### Candidate: "${c.name}"\n` +
            `**Initial reason**: ${c.reason}\n` +
            `**Preliminary Strength**: ${c.absenceStrengthPrelim}\n` +
            exclusionsText +
            `\n**Verification Evidence Packets:**\n` +
            (packetText || '(No specific quotes extracted by Pass 1. Determine omission using global context)');
    }).join('\n\n---\n\n');

    return GHOST_NODES_PASS_2_PROMPT
        .replace('{{DOCUMENT_TYPE}}', documentType)
        .replace('{{DOMINANT_DISCOURSES}}', dominantDiscourses.length > 0 ? dominantDiscourses.join(', ') : 'None identified')
        .replace('{{EXISTING_LABELS}}', existingLabels.length > 0 ? existingLabels.join(', ') : '(none)')
        .replace('{{CANDIDATE_BLOCKS}}', candidateBlocks)
        .replace('{{GLOBAL_CONTEXT}}', globalContext);
}
