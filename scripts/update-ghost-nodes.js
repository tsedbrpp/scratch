import * as fs from 'fs';
import * as path from 'path';

const ghostNodesPath = path.resolve('src/lib/ghost-nodes.ts');
let code = fs.readFileSync(ghostNodesPath, 'utf-8');

// 1. Add Zod import
if (!code.includes("import { z }")) {
    code = code.replace(
        "import { GhostNodeClaim } from './study-config';",
        "import { GhostNodeClaim } from './study-config';\nimport { z } from 'zod';\nimport { GHOST_NODES_COMBINED_PASS_1_PROMPT, GHOST_NODES_PASS_2_PROMPT } from './prompts/ghost-nodes';"
    );
}

// 2. Define Schemas
const schemasToAdd = `
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
    label: DisabilityTaxonomySchema, // Use string for "Other"
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
  }))
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
    })),
    claim: z.string(),
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

`

if (!code.includes("ZOD SCHEMAS FOR RUNTIME VALIDATION")) {
    code = code.replace(
        "// =============================================================================\n// DOCUMENT STRUCTURE PARSING",
        schemasToAdd.replace("DisabilityTaxonomySchema", "DiscourseTaxonomySchema") + "\n// =============================================================================\n// DOCUMENT STRUCTURE PARSING"
    );
}

// 3. Update CandidateActor interface
code = code.replace(
    /interface CandidateActor {\s+name: string;\s+reason: string;\s+absenceStrength: number;\s+keywords: string\[\];\s+explicitExclusions\?: ExclusionMatch\[\];\s+\/\/ NegEx matches \(populated in Pass 1\.5\)\s+}/,
    `interface CandidateActor {
  name: string;
  reason: string;
  absenceStrengthPrelim: "High" | "Medium" | "Low";
  evidencePackets?: Array<{ quote: string; locationMarker: string }>;
  keywords: string[];
  absenceStrength?: number; // legacy backward compatibility
  explicitExclusions?: ExclusionMatch[];  // NegEx matches (populated in Pass 1.5)
}`
);

// 4. Update MAX_DEEP_DIVE_CANDIDATES
code = code.replace(
    "const MAX_DEEP_DIVE_CANDIDATES = 5;",
    "const MAX_DEEP_DIVE_CANDIDATES = 12;"
);

// 5. Add Batch Logic
const batchLogic = `
/** Concurrency limiter utility for batching Promises */
async function asyncBatchProcess<T, R>(items: T[], batchSize: number, processor: (batch: T[], index: number) => Promise<R[]>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.warn(\`[GHOST_NODES] Processing batch \${Math.floor(i / batchSize) + 1} of \${Math.ceil(items.length / batchSize)}\`);
    
    // Process concurrently within the batch using Promise.allSettled
    const batchPromises = batch.map((item, localIndex) => processor([item], i + localIndex));
    const settledResults = await Promise.allSettled(batchPromises);
    
    for (const result of settledResults) {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      } else {
        console.error("[GHOST_NODES] Batch item processing failed:", result.reason);
      }
    }
  }
  return results;
}
`
if (!code.includes("asyncBatchProcess<T, R>")) {
    code = code.replace(
        "const MAX_DEEP_DIVE_CANDIDATES = 12;",
        "const MAX_DEEP_DIVE_CANDIDATES = 12;\n" + batchLogic
    );
}

// 6. Rewrite pass 1 prompt logic
code = code.replace(
    /function buildPass1Prompt[\s\S]*?return `# QUICK SCAN:[\s\S]*?Focus on actors whose absence affects policy legitimacy`;\n}/,
    `function buildPass1Prompt(
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
}`
);

// 7. Rewrite Pass 2 prompt logic
const buildPass2Replacement = `function buildPass2Prompt(
  candidates: CandidateActor[],
  existingLabels: string[],
  documentType: string,
  allSections: DocumentSection[],
  dominantDiscourses: string[] = [],
): string {
  // Add first 3 sections as 'Global Context' to anchor institutional logics
  const globalContext = allSections.slice(0, 3).map(s => {
    return s.heading ? \`[\${s.tag} — \${s.heading}]\\n\${s.content}\` : \`[\${s.tag}]\\n\${s.content}\`;
  }).join('\\n\\n');

  // Build per-candidate evidence blocks using Pass 1 packets
  const candidateBlocks = candidates.map(c => {
    const packets = c.evidencePackets || [];
    const packetText = packets.map(p => \`- Quote: "\${p.quote}" (Location: \${p.locationMarker})\`).join('\\n');
    
    let exclusionsText = '';
    if (c.explicitExclusions && c.explicitExclusions.length > 0) {
      exclusionsText = \`\\n**⚠️ Explicit exclusion detected (\${c.explicitExclusions[0].confidence}):**\\n\` +
        c.explicitExclusions.map(e => \`- Trigger: "\${e.trigger}" → Scope: "...\${e.matchedText.slice(0, 120)}..."\`).join('\\n') +
        \`\\nVerify this exclusion.\`;
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

code = code.replace(/function buildPass2Prompt\([\s\S]*?## CANDIDATES TO ANALYZE[\s\S]*?GLOBAL_CONTEXT}}/m, buildPass2Replacement);

fs.writeFileSync(ghostNodesPath, code, 'utf-8');
console.log("Applied structural changes successfully");
