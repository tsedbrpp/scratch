import { CandidateActor, DocumentSection, FormalActor, AffectedClaim, ObligatoryPassagePoint } from './types';
import { EXPECTED_ACTORS, DISCOURSE_TAXONOMY } from './constants';
import { GNDP_PASS_1A_PROMPT, GNDP_PASS_1B_PROMPT, GNDP_PASS_2_PROMPT, GNDP_PASS_3_PROMPT } from '../prompts/gndp-v1';
// ===================================================================// ===================================================================
// GNDP v1.0 Builders
// ===================================================================

/**
 * Pass 1A: Extraction-only. Produces FormalActors, AffectedClaims, OPPs.
 * No candidates, no scoring, no "ghost" language.
 */
export function buildPass1APrompt(
    structuredText: string,
): string {
    return GNDP_PASS_1A_PROMPT
        .replace('{{STRUCTURED_TEXT}}', structuredText);
}

/**
 * Pass 1B: Candidate synthesis via subtraction.
 * Takes Pass 1A JSON output + context to generate 8-10 candidates with GNDP Phase 1 fields.
 */
export function buildPass1BPrompt(
    formalActors: FormalActor[],
    affectedClaims: AffectedClaim[],
    opps: ObligatoryPassagePoint[],
    existingLabels: string[],
    documentType: string,
): string {
    const expectedActors = EXPECTED_ACTORS[documentType] || EXPECTED_ACTORS["default"];

    return GNDP_PASS_1B_PROMPT
        .replace('{{FORMAL_ACTORS_JSON}}', JSON.stringify(formalActors))
        .replace('{{AFFECTED_CLAIMS_JSON}}', JSON.stringify(affectedClaims))
        .replace('{{OPPS_JSON}}', JSON.stringify(opps))
        .replace('{{DOCUMENT_TYPE}}', documentType)
        .replace('{{EXPECTED_ACTORS}}', expectedActors.join(', '))
        .replace('{{EXISTING_LABELS}}', existingLabels.length > 0 ? existingLabels.join(', ') : '(none)');
}

/**
 * Pass 2 (GNDP): Deep dive with evidence grading, typology, weighted scoring.
 * Injects Pass 1B GNDP fields into candidate blocks.
 */
export function buildGndpPass2Prompt(
    candidates: CandidateActor[],
    existingLabels: string[],
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
        // Inject GNDP Phase 1 fields from Pass 1B
        const gndpFields = [
            c.materialImpact ? `**Material Impact**: ${c.materialImpact}` : '',
            c.oppAccess ? `**OPP Access**: ${c.oppAccess}` : '',
            c.sanctionPower ? `**Sanction Power**: ${c.sanctionPower}` : '',
            c.dataVisibility ? `**Data Visibility**: ${c.dataVisibility}` : '',
            c.representationType ? `**Representation**: ${c.representationType}` : '',
        ].filter(Boolean).join('\n');

        return `### Candidate: "${c.name}"\n` +
            `**Initial reason**: ${c.reason}\n` +
            `**Preliminary Strength**: ${c.absenceStrengthPrelim}\n` +
            (gndpFields ? `\n${gndpFields}\n` : '') +
            exclusionsText +
            `\n**Verification Evidence Packets:**\n` +
            (packetText || '(No specific quotes extracted. Determine omission using global context)');
    }).join('\n\n---\n\n');

    return GNDP_PASS_2_PROMPT
        .replace('{{DOMINANT_DISCOURSES}}', dominantDiscourses.length > 0 ? dominantDiscourses.join(', ') : 'None identified')
        .replace('{{EXISTING_LABELS}}', existingLabels.length > 0 ? existingLabels.join(', ') : '(none)')
        .replace('{{CANDIDATE_BLOCKS}}', candidateBlocks)
        .replace('{{GLOBAL_CONTEXT}}', globalContext);
}

/**
 * Pass 3: Counterfactual power test (v2 — structured scenario analysis).
 * Takes top 6 validated ghost nodes + OPPs for speculative scenario analysis.
 */
export function buildPass3Prompt(
    validatedGhostNodes: Array<{ id: string; label: string; ghostReason: string; absenceScore?: number | null; ghostType?: string | null }>,
    opps?: Array<{ name: string; type: string; controllingActor?: string }>,
): string {
    const candidateBlocks = validatedGhostNodes.slice(0, 6).map(g => {
        return `### ${g.label} (${g.id})\n` +
            `**Ghost Reason**: ${g.ghostReason}\n` +
            (g.ghostType ? `**Type**: ${g.ghostType}\n` : '') +
            (g.absenceScore != null ? `**Absence Score**: ${g.absenceScore}\n` : '');
    }).join('\n\n---\n\n');

    const oppBlocks = opps && opps.length > 0
        ? opps.map(o => `- **${o.name}** (${o.type})${o.controllingActor ? ` — controlled by: ${o.controllingActor}` : ''}`).join('\n')
        : '(No specific OPPs extracted from document — use reasonable governance gates)';

    return GNDP_PASS_3_PROMPT
        .replace('{{CANDIDATE_BLOCKS}}', candidateBlocks)
        .replace('{{OPP_BLOCKS}}', oppBlocks);
}

