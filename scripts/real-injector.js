const fs = require('fs');
const path = require('path');

const file = path.resolve('src/lib/ghost-nodes.ts');
let code = fs.readFileSync(file, 'utf8');

// The schemas:
const schemas = `
// =============================================================================
// ZOD SCHEMAS FOR RUNTIME VALIDATION
// =============================================================================

export const DiscourseTaxonomySchema = z.enum([
  'market efficiency',
  'economic competitiveness',
  'national security',
  'environmental sustainability',
  'social equity',
  'technical expertise',
  'bureaucratic standardization',
  'innovation / flexibility',
  'fiscal responsibility',
  'democratic participation',
  'data protection / privacy',
  'human rights',
  'geopolitical sovereignty',
  'precautionary principle / risk aversion'
]).or(z.string()); 

export const GhostNodesPass1Schema = z.object({
  dominantDiscourses: z.array(z.object({
    label: DiscourseTaxonomySchema, // Use string for "Other"
    strength: z.number().min(0).max(1),
    evidenceQuote: z.string(),
    isOther: z.boolean().optional(),
    otherLabel: z.string().optional(),
    whyNotInTaxonomy: z.string().optional(),
    closestTaxonomyCandidate: z.string().optional()
  })),
  ghostNodeCandidates: z.array(z.object({
    name: z.string(),
    reason: z.string(),
    absenceStrengthPrelim: z.enum(["High", "Medium", "Low"]),
    evidencePackets: z.array(z.object({
      quote: z.string(),
      locationMarker: z.string()
    })).optional(),
    keywords: z.array(z.string())
  })).optional().default([])
});

export const GhostNodesPass2Schema = z.object({
  ghostNodes: z.array(z.object({
    isValid: z.boolean(),
    tier: z.enum(["Tier1", "Tier2", "Tier3"]).optional(),
    id: z.string(),
    label: z.string(),
    category: z.string().optional(),
    ghostReason: z.string(),
    absenceStrength: z.number().optional(),
    evidenceQuotes: z.array(z.object({
      quote: z.string(),
      context: z.string().optional()
    })).optional().default([]),
    claim: z.string().optional(),
    discourseThreats: z.array(z.string()).optional(),
    missingSignals: z.array(z.object({
      signal: z.string(),
      searchTerms: z.array(z.string())
    })).optional(),
    absenceType: z.string().optional(),
    exclusionType: z.string().optional(),
    institutionalLogics: z.object({
      market: z.number(),
      state: z.number(),
      professional: z.number(),
      community: z.number()
    }).optional()
  }))
});
`;

if (!code.includes('GhostNodesPass1Schema')) {
  code = code.replace("import { GHOST_NODES_COMBINED_PASS_1_PROMPT, GHOST_NODES_PASS_2_PROMPT } from './prompts/ghost-nodes';", "import { GHOST_NODES_COMBINED_PASS_1_PROMPT, GHOST_NODES_PASS_2_PROMPT } from './prompts/ghost-nodes';\n" + schemas);
}

// Ensure the mapping is typed as any if not already
code = code.replace(
  /dominantDiscoursesFromDoc = pass1Data\.dominantDiscourses\.map\(\s*d\s*=>/g,
  "dominantDiscoursesFromDoc = pass1Data.dominantDiscourses.map((d: any) =>"
);

// We need to replace buildPass1Prompt, scoreAndSelectSections, and buildPass2Prompt exactly
// buildPass1Prompt starts around line 670, ends with buildPass2Prompt returning around line 960

const prompts = `function buildPass1Prompt(
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
    ? \`\\n**User-specified expected actors:** \${dedupedUserActors.join(', ')}\`
    : '';

  return GHOST_NODES_COMBINED_PASS_1_PROMPT
    .replace('{{DISCOURSE_TAXONOMY}}', DISCOURSE_TAXONOMY.map(t => '- ' + t).join('\\n'))
    .replace('{{DOCUMENT_TYPE}}', documentType)
    .replace('{{EXPECTED_ACTORS}}', expectedActors.join(', '))
    .replace('{{USER_ACTORS}}', userActorsLine)
    .replace('{{EXISTING_LABELS}}', existingLabels.length > 0 ? existingLabels.join(', ') : '(none yet)')
    .replace('{{STRUCTURED_TEXT}}', structuredText);
}

function buildPass2Prompt(
  candidates: CandidateActor[],
  existingLabels: string[],
  documentType: string,
  allSections: DocumentSection[],
  dominantDiscourses: string[] = [],
): string {
  const globalContext = allSections.slice(0, 3).map(s => {
    return s.heading ? \`[\${s.tag} — \${s.heading}]\\n\${s.content}\` : \`[\${s.tag}]\\n\${s.content}\`;
  }).join('\\n\\n');

  const candidateBlocks = candidates.map(c => {
    const packets = c.evidencePackets || [];
    const packetText = packets.map(p => \`- Quote: "\${p.quote}" (Location: \${p.locationMarker})\`).join('\\n');
    let exclusionsText = '';
    if (c.explicitExclusions && c.explicitExclusions.length > 0) {
      exclusionsText = \`\\n**⚠️ Explicit exclusion detected (\${c.explicitExclusions[0].confidence}):**\\n\` +
        c.explicitExclusions.map(e => \`- Trigger: "\${e.trigger}" → Scope: "...\${e.matchedText.slice(0, 120)}..."\`).join('\\n') +
        \`\\nVerify this exclusion.\\n\`;
    }
    return \`### Candidate: "\${c.name}"\\n\` +
           \`**Initial reason**: \${c.reason}\\n\` +
           \`**Preliminary Strength**: \${c.absenceStrengthPrelim}\\n\` +
           exclusionsText +
           \`\\n**Verification Evidence Packets:**\\n\` +
           (packetText || '(No specific quotes extracted by Pass 1. Determine omission using global context)');
  }).join('\\n\\n---\\n\\n');

  return GHOST_NODES_PASS_2_PROMPT
    .replace('{{DOCUMENT_TYPE}}', documentType)
    .replace('{{DOMINANT_DISCOURSES}}', dominantDiscourses.length > 0 ? dominantDiscourses.join(', ') : 'None identified')
    .replace('{{EXISTING_LABELS}}', existingLabels.length > 0 ? existingLabels.join(', ') : '(none)')
    .replace('{{CANDIDATE_BLOCKS}}', candidateBlocks)
    .replace('{{GLOBAL_CONTEXT}}', globalContext);
}`;

let startIdx = code.indexOf('function buildPass1Prompt(');
let endIdx = code.indexOf('// --- Absent Actor type for AI response parsing ---');
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + prompts + "\n\n" + code.substring(endIdx);
} else {
  console.log("Could not find start or end index for prompt functions!");
}

fs.writeFileSync(file, code, 'utf8');
console.log('Fixed properly');
