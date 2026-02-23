/**
 * Ghost Node Detection Utilities
 * Adapted from Ghost Nodes mobile app for InstantTea web platform
 */
import * as fs from 'fs';
import { GhostNodeClaim } from './study-config';

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
function isDuplicateConcept(ghostLabel: string, existingNodes: Array<{ label?: string; id?: string }>): boolean {
  const SIMILARITY_THRESHOLD = 0.4; // 40% token overlap = duplicate

  for (const node of existingNodes) {
    // Check both label and id fields
    const nodeText = node.label || node.id;
    if (!nodeText) continue;
    const similarity = calculateSimilarity(ghostLabel, nodeText);
    if (similarity >= SIMILARITY_THRESHOLD) {
      console.warn(`[GHOST_NODES] Filtering duplicate: "${ghostLabel}" matches "${nodeText}" (${(similarity * 100).toFixed(0)}% similar)`);
      return true;
    }
  }
  return false;
}

export interface DetectedGhostNode {
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
  evidenceQuotes?: Array<{
    quote: string;
    actors: string[];
    sourceRef: string;
  }>;
  claim?: GhostNodeClaim;
  roster?: {
    actors: string[];
    mechanisms: string[];
  };
  missingSignals?: Array<{
    signal: string;
    searchTerms: string[];
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
  _documentType: string = "policy",
): DetectedGhostNode[] {
  const ghostNodes: DetectedGhostNode[] = [];

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

// =============================================================================
// DOCUMENT STRUCTURE PARSING
// =============================================================================

/** A parsed section of a policy document */
interface DocumentSection {
  tag: string;         // e.g., "Article 12", "Preamble"
  heading?: string;    // Optional heading, e.g., "Stakeholder Consultation"
  content: string;     // Section body text
  charOffset: number;  // Position in original text
  charLength: number;  // Length of the content
}

/** Result of parsing a document into sections */
interface ParsedDocument {
  sections: DocumentSection[];
  parsingConfidence: number; // 0-1 based on ratio of tagged vs fallback content
}

/** Stakeholder-relevant keywords for section prioritization */
const STAKEHOLDER_KEYWORDS = [
  'stakeholder', 'consultation', 'participation', 'governance', 'oversight',
  'public interest', 'transparency', 'accountability', 'representation',
  'community', 'civil society', 'obligation', 'rights', 'affected',
  'deployer', 'provider', 'operator', 'user', 'citizen', 'consumer',
  'worker', 'labor', 'employment', 'union', 'indigenous', 'vulnerable',
  'marginalized', 'excluded', 'environment', 'sustainability',
];

// =============================================================================
// NEGEX-INSPIRED EXPLICIT EXCLUSION DETECTION
// =============================================================================

/** Result of matching a negation trigger against a candidate */
interface ExclusionMatch {
  trigger: string;       // The negation phrase that fired
  matchedText: string;   // The captured scope text after the trigger
  confidence: 'strong' | 'weak';  // strong = name match, weak = ≥2 keyword hits
}

/** Pre-negation trigger patterns — matched at sente-level scope */
const PRE_NEGATION_TRIGGERS = [
  // Direct exclusion verbs
  /(?:does|shall|will|would|may|can)(?:\s+not)\s+(?:apply|extend|cover|include|impose|require|obligate)\s+(?:to\s+)?/gi,
  // Exclusion nouns/adjectives
  /(?:exclud(?:es?|ing|ed)?|exempt(?:s|ing|ed)?|except(?:ing)?)\s+/gi,
  // Prepositional exclusions
  /(?:other than|apart from|with the exception of|inapplicable to|not subject to|outside (?:the )?scope of)\s+/gi,
  // Scope-limiting (pseudo-negation — weaker signal)
  /(?:limited to|restricted to|confined to|only (?:applies?|relevant|intended) (?:to|for))\s+/gi,
];

/** Terminators that end the exclusion scope */
const SCOPE_TERMINATORS = /(?:\.|;|\n|(?:\b(?:but|however|except|although|unless)\b))/;

/** Max characters after trigger to search for candidate matches */
const NEGATION_WINDOW_CHARS = 200;

/**
 * Pseudo-negation patterns — these look like negation but should NOT trigger exclusions.
 * Classic NegEx / ConText false-positive suppressors.
 */
const PSEUDO_NEGATION = [
  /no\s+(?:change|increase|decrease|evidence|sign|indication|history|prior|previous|further)/gi,
  /(?:rule out|free of|without evidence of|regardless of|in lieu of|irrespective of)/gi,
  /not\s+(?:shown|demonstrated|apparent|necessarily|always|unlike)/gi,
  /no\s+(?:obligation|requirement|duty)\s+(?:exists?|arises?)\s+until/gi,
];

/**
 * Post-negation triggers — patterns appearing AFTER the actor mention.
 * Captures "[Actor] … excluded from …" patterns.
 */
const POST_NEGATION_TRIGGERS = [
  /excluded from|not included in|shall not include|does not extend to/gi,
  /exempt from|outside the scope of|inapplicable to/gi,
  /not covered by|not subject to|removed from/gi,
];

/** Standardized discourse labels for conflict mapping */
const DISCOURSE_TAXONOMY = [
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
  'precautionary principle / risk aversion',
] as const;

/**
 * Detect explicit exclusions in document text using NegEx-inspired scope-aware matching.
 * Returns a map of candidate names → array of exclusion matches.
 * Zero API cost — entirely deterministic.
 */
function detectExplicitExclusions(
  text: string,
  candidates: CandidateActor[],
): Map<string, ExclusionMatch[]> {
  const results = new Map<string, ExclusionMatch[]>();
  // Split into sentences for scope containment
  const sentences = text.split(/(?<=[.;!?\n])\s+/);

  for (const sentence of sentences) {
    // Skip sentences that match pseudo-negation patterns (false positives)
    const sentenceLower = sentence.toLowerCase();
    const isPseudoNegation = PSEUDO_NEGATION.some(p => {
      const regex = new RegExp(p.source, p.flags);
      return regex.test(sentenceLower);
    });
    if (isPseudoNegation) continue;

    // --- Pre-negation triggers (original logic) ---
    for (const pattern of PRE_NEGATION_TRIGGERS) {
      // Create fresh regex per sentence to reset lastIndex
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(sentence)) !== null) {
        // Extract scope: text after trigger, up to terminator or window limit
        const afterTrigger = sentence.slice(match.index + match[0].length);
        const scopeEnd = afterTrigger.search(SCOPE_TERMINATORS);
        const scope = afterTrigger
          .slice(0, scopeEnd > 0 ? scopeEnd : NEGATION_WINDOW_CHARS)
          .toLowerCase();
        const triggerText = match[0].trim();

        // Check each candidate against the scope
        for (const candidate of candidates) {
          const nameLower = candidate.name.toLowerCase();
          const exclusionEntry: ExclusionMatch = {
            trigger: triggerText,
            matchedText: scope.trim(),
            confidence: 'weak',
          };

          // Strong match: candidate name appears in scope
          if (scope.includes(nameLower)) {
            exclusionEntry.confidence = 'strong';
            const existing = results.get(candidate.name) || [];
            existing.push(exclusionEntry);
            results.set(candidate.name, existing);
            continue;
          }

          // Weak match: ≥2 keywords appear in scope
          const kwHits = candidate.keywords.filter(
            kw => scope.includes(kw.toLowerCase())
          ).length;
          if (kwHits >= 2) {
            const existing = results.get(candidate.name) || [];
            existing.push(exclusionEntry);
            results.set(candidate.name, existing);
          }
        }
      }
    }

    // --- Post-negation triggers (actor appears BEFORE the negation cue) ---
    for (const candidate of candidates) {
      const nameIdx = sentenceLower.indexOf(candidate.name.toLowerCase());
      if (nameIdx < 0) continue;
      // Only look at text AFTER the actor name
      const afterName = sentence.slice(nameIdx + candidate.name.length);
      for (const postPattern of POST_NEGATION_TRIGGERS) {
        const postRegex = new RegExp(postPattern.source, postPattern.flags);
        if (postRegex.test(afterName)) {
          const existing = results.get(candidate.name) || [];
          existing.push({
            trigger: afterName.match(new RegExp(postPattern.source, postPattern.flags))![0].trim(),
            matchedText: afterName.slice(0, NEGATION_WINDOW_CHARS).trim(),
            confidence: 'strong', // post-pattern with explicit name is strong
          });
          results.set(candidate.name, existing);
          break; // one post-trigger per sentence per candidate is enough
        }
      }
    }
  }

  return results;
}

/**
 * Parse raw document text into semantically tagged sections.
 * Uses flexible, case-insensitive regex patterns for common policy document formats.
 */
function parseDocumentSections(text: string): ParsedDocument {
  const sections: DocumentSection[] = [];
  let taggedChars = 0;

  // Combined regex for structural markers (case-insensitive, multiline)
  const sectionPattern = /(?:^|\n)\s*(?:(?:(article|artikel|art\.)\s+(\d+(?:\.\d+)?))|(?:(section|sec\.)\s+(\d+(?:\.\d+)*))|(?:(recital|whereas)\s*(\d*))|(?:(chapter|part)\s+(\d+(?:\.\d+)?))|(?:(#{1,3})\s+(.+?)$)|(?:(\d+(?:\.\d+)*)\.\s+([A-Z][^\n]{5,})))\s*[—–:\-.]?\s*([^\n]*)/gim;

  const matches: Array<{ index: number; tag: string; heading: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = sectionPattern.exec(text)) !== null) {
    let tag = '';
    let heading = '';

    if (match[1]) {
      // Article pattern
      tag = `Article ${match[2]}`;
      heading = match[13]?.trim() || '';
    } else if (match[3]) {
      // Section pattern
      tag = `Section ${match[4]}`;
      heading = match[13]?.trim() || '';
    } else if (match[5]) {
      // Recital/Whereas pattern
      tag = match[6] ? `Recital ${match[6]}` : 'Recital';
      heading = match[13]?.trim() || '';
    } else if (match[7]) {
      // Chapter/Part pattern
      tag = `${match[7].charAt(0).toUpperCase() + match[7].slice(1).toLowerCase()} ${match[8]}`;
      heading = match[13]?.trim() || '';
    } else if (match[9]) {
      // Markdown heading
      tag = `Heading (L${match[9].length})`;
      heading = match[10]?.trim() || '';
    } else if (match[11]) {
      // Numbered heading (e.g., "1. Introduction")
      tag = `Section ${match[11]}`;
      heading = match[12]?.trim() || '';
    }

    if (tag) {
      matches.push({ index: match.index, tag, heading });
    }
  }

  // Build sections from matches
  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
      const content = text.substring(start, end).trim();

      sections.push({
        tag: matches[i].tag,
        heading: matches[i].heading || undefined,
        content,
        charOffset: start,
        charLength: content.length,
      });
      taggedChars += content.length;
    }
  }

  // If no structural markers found, fall back to paragraph chunking
  if (sections.length === 0) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    paragraphs.forEach((para, idx) => {
      const offset = text.indexOf(para);
      sections.push({
        tag: `Paragraph ${idx + 1}`,
        content: para.trim(),
        charOffset: offset >= 0 ? offset : 0,
        charLength: para.trim().length,
      });
    });
    // Fallback paragraphs don't count as "tagged"
    taggedChars = 0;
  }

  const parsingConfidence = text.length > 0 ? Math.min(taggedChars / text.length, 1.0) : 0;

  console.warn(`[GHOST_NODES] Parsed ${sections.length} sections (confidence: ${(parsingConfidence * 100).toFixed(0)}%)`);

  return { sections, parsingConfidence };
}

/**
 * Format sections into tagged text for AI prompt injection.
 * Prioritizes stakeholder-relevant sections. Truncates if over budget.
 */
function formatSectionsForPrompt(sections: DocumentSection[], charBudget: number): string {
  // Score each section by stakeholder relevance
  const scored = sections.map(s => {
    const textLower = (s.content + ' ' + (s.heading || '')).toLowerCase();
    const relevance = STAKEHOLDER_KEYWORDS.reduce(
      (score, kw) => score + (textLower.includes(kw) ? 1 : 0), 0
    );
    // Structural priority bonus for preamble, introduction, definitions, conclusion
    const structuralBonus = /preamble|introduction|definitions?|conclusion|scope|purpose/i.test(s.tag + ' ' + (s.heading || '')) ? 3 : 0;
    return { section: s, score: relevance + structuralBonus };
  });

  // Sort by relevance (highest first), then by document order for ties
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.section.charOffset - b.section.charOffset;
  });

  let output = '';
  let remaining = charBudget;

  for (const { section } of scored) {
    const header = section.heading
      ? `[SECTION: ${section.tag} — ${section.heading}] (chars ${section.charOffset}-${section.charOffset + section.charLength})`
      : `[SECTION: ${section.tag}] (chars ${section.charOffset}-${section.charOffset + section.charLength})`;

    const entry = `${header}\n${section.content}\n\n`;

    if (entry.length <= remaining) {
      output += entry;
      remaining -= entry.length;
    } else if (remaining > 200) {
      // Truncate this section to fit
      output += `${header}\n${section.content.substring(0, remaining - header.length - 20)}...\n\n`;
      break;
    } else {
      break;
    }
  }

  return output;
}

// =============================================================================
// MULTI-PASS PIPELINE TYPES & FUNCTIONS
// =============================================================================

/** Candidate actor from Pass 1 (broad scan) */
interface CandidateActor {
  name: string;
  reason: string;
  absenceStrength: number;
  keywords: string[];
  explicitExclusions?: ExclusionMatch[];  // NegEx matches (populated in Pass 1.5)
}

/** Maximum candidates to promote from Pass 1 to Pass 2 */
const MAX_DEEP_DIVE_CANDIDATES = 5;

/**
 * Parse user-provided expected actors from textarea input.
 * One actor per line, trimmed, deduped, hard-capped at 20.
 */
function parseUserExpectedActors(input?: string): string[] {
  if (!input) return [];
  return [...new Set(
    input
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
  )].slice(0, 20);
}

/**
 * Build the Pass 1 (broad scan) prompt.
 * Uses gpt-4o-mini for cheap, fast candidate generation.
 */
/**
 * Pass 0.5: Extract dominant discourses to anchor Pass 2 analysis
 */
async function extractDominantDiscourses(
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
  } catch (e) {
    console.warn('[GHOST_NODES] Pass 0.5 failed, using fallback:', e);
    return [...DISCOURSE_TAXONOMY.slice(0, 4)];
  }
}

function buildPass1Prompt(
  structuredText: string,
  existingLabels: string[],
  documentType: string,
  userExpectedActors?: string[],
): string {
  const expectedActors = EXPECTED_ACTORS[documentType] || EXPECTED_ACTORS["default"];
  // Dedup user actors against built-in list
  const dedupedUserActors = userExpectedActors?.filter(
    ua => !expectedActors.some(ea => ea.toLowerCase() === ua.toLowerCase())
  ) || [];
  const userActorsLine = dedupedUserActors.length > 0
    ? `\n**User-specified expected actors:** ${dedupedUserActors.join(', ')}`
    : '';
  return `# QUICK SCAN: Absent Actor Detection

## Task
Quickly scan this ${documentType} document and identify **8-12 actor types** that are absent, marginalized, or silenced.

## Reference Frames
**Expected actors for "${documentType}" documents:** ${expectedActors.join(', ')}${userActorsLine}
**Actors already identified in this document:** ${existingLabels.length > 0 ? existingLabels.join(', ') : '(none yet)'}

## Document Sections
${structuredText}

## Output
Return ONLY a JSON object with this structure:
\`\`\`json
{
  "candidates": [
    {
      "name": "Actor Name",
      "reason": "One-sentence explanation of why this actor is absent",
      "absenceStrength": 75,
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}
\`\`\`

**Rules:**
- Score absenceStrength from 0-100 (higher = more significant absence)
- Include 3-5 keywords related to this actor's domain (used for section relevance scoring)
- Be specific: "Gig Economy Workers" not just "Workers"
- Do NOT include actors already present in the existing network
- Focus on actors whose absence affects policy legitimacy`;
}

/**
 * Pass 1.5: Score document sections for relevance to each candidate.
 * Returns the top sections per candidate (no API cost).
 */
function scoreAndSelectSections(
  candidates: CandidateActor[],
  sections: DocumentSection[],
  maxSectionsPerCandidate: number = 7,
): Map<string, DocumentSection[]> {
  const result = new Map<string, DocumentSection[]>();

  for (const candidate of candidates) {
    const candidateTerms = [
      candidate.name.toLowerCase(),
      ...candidate.keywords.map(k => k.toLowerCase()),
    ];

    const scored = sections.map(section => {
      const textLower = (section.content + ' ' + (section.heading || '')).toLowerCase();

      // 1. Keyword frequency score
      let keywordScore = 0;
      for (const term of candidateTerms) {
        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = textLower.match(regex);
        keywordScore += matches ? matches.length : 0;
      }

      // 2. Structural priority bonus
      let structuralBonus = 0;
      if (/preamble|introduction|scope|purpose|definitions?/i.test(section.tag + ' ' + (section.heading || ''))) {
        structuralBonus = 2;
      }
      if (/conclusion|enforcement|compliance|penalties|obligations/i.test(section.tag + ' ' + (section.heading || ''))) {
        structuralBonus += 1;
      }

      // 3. Stakeholder keyword overlap
      const stakeholderScore = STAKEHOLDER_KEYWORDS.reduce(
        (score, kw) => score + (textLower.includes(kw) ? 0.5 : 0), 0
      );

      return { section, score: keywordScore + structuralBonus + stakeholderScore };
    });

    // Sort by score descending, take top N
    scored.sort((a, b) => b.score - a.score);
    result.set(candidate.name, scored.slice(0, maxSectionsPerCandidate).map(s => s.section));
  }

  return result;
}

/**
 * Build the Pass 2 (deep dive) prompt for a specific set of candidates.
 * Receives only the relevant sections for evidence grounding.
 */
function buildPass2Prompt(
  candidates: CandidateActor[],
  candidateSections: Map<string, DocumentSection[]>,
  existingLabels: string[],
  documentType: string,
  allSections: DocumentSection[],
  dominantDiscourses: string[] = [],
): string {
  // Add first 3 sections as 'Global Context' to anchor institutional logics
  const globalContext = allSections.slice(0, 3).map(s => {
    return s.heading ? `[${s.tag} — ${s.heading}]\n${s.content}` : `[${s.tag}]\n${s.content}`;
  }).join('\n\n');

  // Build per-candidate context blocks
  const candidateBlocks = candidates.map(c => {
    const sections = candidateSections.get(c.name) || [];

    // Smarter truncation logic with ~4000 char budget
    let sectionText = '';
    let remainingBudget = 4000;

    for (const s of sections) {
      const entry = s.heading
        ? `[${s.tag} — ${s.heading}]\n${s.content}\n\n`
        : `[${s.tag}]\n${s.content}\n\n`;

      if (entry.length <= remainingBudget) {
        sectionText += entry;
        remainingBudget -= entry.length;
      } else if (remainingBudget > 300) {
        // Partial fit for the last chunk
        sectionText += entry.substring(0, remainingBudget - 100) + '\n... [truncated due to length budget]\n\n';
        break;
      } else {
        break;
      }
    }

    return `### Candidate: "${c.name}"
**Initial reason**: ${c.reason}
**Initial score**: ${c.absenceStrength}/100
${c.explicitExclusions?.length ? `
**⚠️ Explicit exclusion detected (${c.explicitExclusions[0].confidence}):**
${c.explicitExclusions.map(e => `- Trigger: "${e.trigger}" → Scope: "...${e.matchedText.slice(0, 120)}..."`).join('\n')}
Verify this exclusion and assess its impact on the actor's absence.
` : ''}
**Relevant document sections:**
${sectionText || '(No highly relevant sections found — use general document context)'}`;
  }).join('\n\n---\n\n');

  return `# DEEP FORENSIC ANALYSIS: Absent Actor Verification

${dominantDiscourses.length > 0 ? `**KNOWN DOMINANT DISCOURSES (Use these preferentially for categorization):**
${dominantDiscourses.join(', ')}

` : ''}
## Task
Perform deep forensic analysis on ${candidates.length} pre-screened absent actor candidates.
For each candidate, verify their absence and assess their potential impact if they were included.

**CRITICAL: If a candidate is NOT verified as a meaningful absence after deep analysis, OMIT them from the \`absentActors\` array. However, you MUST ALWAYS return the \`institutionalLogics\` and \`methodologicalNotes\` objects.**

## Existing Network Actors
${existingLabels.length > 0 ? existingLabels.join(', ') : '(none)'}

## Institutional Logic Framework
Assess the document's dominant logics:
- **Market Logic**: Profit, efficiency, competition, innovation
- **State Logic**: Regulation, public interest, sovereignty, compliance
- **Professional Logic**: Expertise, credentials, technical standards
- **Community Logic**: Participation, solidarity, local knowledge, equity

---

## CANDIDATES TO ANALYZE

${candidateBlocks}

---

## Global Document Context (For Logic Assessment)
${globalContext}

---

Return ONLY valid JSON. 

**CRITICAL: You MUST return ALL three top-level keys: \`institutionalLogics\`, \`absentActors\`, and \`methodologicalNotes\`. If NO absent actors are verified, return \`"absentActors": []\`. NEVER return an empty object \`{}\`.**

### Valid Enum Values (use exactly one of these for each field — do NOT put pipes in your response):
- **absenceType**: textual-absence, structural-exclusion, discursive-marginalization, constitutive-silence
- **exclusionType**: silenced, marginalized, structurally-excluded, displaced
- **conflictType** (for discourseThreats): contradicts, undermines, complicates, challenges
- **dominantDiscourse** (for discourseThreats): use one of: ${DISCOURSE_TAXONOMY.join(', ')}, or "Other: [brief label]"

\`\`\`json
{
  "institutionalLogics": {
    "market": { "strength": 0.8, "champions": ["Actor A", "Actor B"], "material": "Description of material practices", "discursive": "Description of discursive patterns" },
    "state": { "strength": 0.5, "champions": ["Actor C"], "material": "...", "discursive": "..." },
    "professional": { "strength": 0.3, "champions": ["Actor D"], "material": "...", "discursive": "..." },
    "community": { "strength": 0.1, "champions": ["Actor E"], "material": "...", "discursive": "..." }
  },
  "absentActors": [
    {
      "name": "Example Absent Actor",
      "absenceType": "structural-exclusion",
      "reason": "Detailed explanation citing document framing (min 100 chars for strong absences)",
      "absenceStrength": 75,
      "exclusionType": "silenced",
      "institutionalLogics": { "market": 0.1, "state": 0.2, "professional": 0.1, "community": 0.9 },
      "evidence": [
        {
          "quote": "Section 12 states 'communities shall be informed' but defines communities as municipal governments only.",
          "rationale": "This implicitly excludes non-municipal community groups from formal consultation."
        }
      ],
      "potentialConnections": [
        { "targetActor": "...", "relationshipType": "...", "evidence": "..." }
      ],
      "discourseThreats": [
        {
          "dominantDiscourse": "market efficiency",
          "conflictType": "contradicts",
          "explanation": "1-2 sentences. Quote evidence from the document."
        }
      ],
      "evidenceQuotes": [
        {
          "quote": "Exact text extracted as a verifiable substring...",
          "actors": ["Actor Name"],
          "sourceRef": "Section 12"
        }
      ],
      "claim": {
        "summaryBullets": ["Key point 1", "Key point 2"],
        "disambiguations": ["Do not confuse this with X"],
        "fullReasoning": "Detailed theoretical framing explaining the significance of this absence in the document's context."
      },
      "roster": {
        "actors": ["Actor A", "Actor B (who is present instead)"],
        "mechanisms": ["Mechanism X"]
      },
      "missingSignals": [
        {
          "signal": "Public Hearing",
          "searchTerms": ["hearing", "consultation", "comment"]
        }
      ]
    }
  ],
  "methodologicalNotes": "Brief explanation of analytical approach and any potential biases"
}
\`\`\`

### Example Mapping of an Absence:
**Candidate**: "Local Farmers"
**Absence Type**: "structural-exclusion"
**Reason**: "The policy centers industrial export-led agriculture, providing no mechanism for small-holder participation or protection."
**Potential Connection**:
- **targetActor**: "National Agricultural Registry"
- **relationshipType**: "excludes from registration criteria"
- **evidence**: "Section 4 defines eligible producers as 'entities with minimum 100 hectares', which structurally excludes small-scale farmers."

## Quality Requirements
1. **Evidence should cite document framing** using **evidenceQuotes**. Extract verbatim substrings and cite their section.
2. **targetActor must use EXACT names** from the existing network
3. **absenceStrength** — recalibrate based on deep evidence:
   - 0-30 (Weak): Mentioned but underrepresented
   - 30-60 (Moderate): Missing from key sections
   - 60-85 (Strong): Systematically excluded
   - 85-100 (Critical): Exclusion undermines policy legitimacy
4. If a candidate does NOT hold up under deep analysis, **lower its score or omit it**
5. Include **methodologicalNotes** explaining your analytical approach
6. For **discourseThreats**, identify 0–2 dominant discourses that this actor's inclusion would challenge. Use the standardized labels when possible. Quote evidence. If no clear conflict exists, return an empty array.
7. For **claim**, provide objectively phrased bullet points summarizing why the actor is missing, disambiguations to ensure the user doesn't confuse them with other listed actors, and a full paragraph of reasoning.
8. For **roster**, list all actors and governance mechanisms *actually explicitly mentioned* inside the quoted text blocks.
9. For **missingSignals**, if governance roles for this actor are absent, list 1-3 mechanisms that *should* have been there (e.g., "Public Consultation", "Citizen Audits") and suggest a few search terms the user could use to look for them.

## Reflexivity Check
Before finalizing, consider:
- Am I over-representing certain actor types due to training data biases?
- Am I assuming governance norms that may not apply to this ${documentType}?
- Am I flagging absences that are genuinely irrelevant to this policy domain?`;
}

// =============================================================================
// EXISTING TYPES (Absent Actor, Validation)
// =============================================================================

// --- Absent Actor type for AI response parsing ---
interface AbsentActorResponse {
  name: string;
  absenceType?: string;
  reason: string;
  absenceStrength?: number;
  exclusionType?: 'silenced' | 'marginalized' | 'structurally-excluded' | 'displaced';
  institutionalLogics?: {
    market: number;
    state: number;
    professional: number;
    community: number;
  };
  evidence?: Array<{
    quote?: string;
    rationale: string;
  }>;
  potentialConnections?: Array<{
    targetActor: string;
    relationshipType: string;
    evidence: string;
  }>;
  discourseThreats?: Array<{
    dominantDiscourse: string;
    conflictType: string;
    explanation: string;
  }>;
  evidenceQuotes?: Array<{
    quote: string;
    actors: string[];
    sourceRef: string;
  }>;
  claim?: {
    summaryBullets: string[];
    disambiguations: string[];
    fullReasoning: string;
  };
  roster?: {
    actors: string[];
    mechanisms: string[];
  };
  missingSignals?: Array<{
    signal: string;
    searchTerms: string[];
  }>;
}

// --- Validation types ---
interface ValidationIssue {
  actor: string;
  field: string;
  message: string;
}

/**
 * Validate the AI response for quality and correctness.
 * Uses substring search against the source document to verify evidence grounding.
 */
function validateGhostNodeResponse(
  absentActors: AbsentActorResponse[],
  existingNodeLabels: string[],
  sourceText: string,
  candidateSections: Map<string, DocumentSection[]>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  absentActors.forEach(actor => {
    const actorSections = candidateSections.get(actor.name) || [];
    const actorEvidenceLower = actorSections.map(s => (s.heading || '') + '\n' + s.content).join('\n').toLowerCase();

    // Check evidence is grounded in the source document via substring search
    actor.potentialConnections?.forEach(conn => {
      // Extract quoted phrases from evidence (text between quotation marks)
      const quotedPhrases = conn.evidence.match(/["\u201c\u201d]([^"\u201c\u201d]{5,})["\u201c\u201d]/g)
        ?.map(q => q.replace(/["\u201c\u201d]/g, '').trim().toLowerCase()) || [];

      // Also check for article/section references as a secondary signal
      const hasArticleRef = /(?:article|section|recital|chapter)\s+\d/i.test(conn.evidence);

      // Verify quoted phrases exist in specific candidate sections (tighter grounding)
      const groundedQuotes = quotedPhrases.filter(phrase => actorEvidenceLower.includes(phrase));
      const isGrounded = groundedQuotes.length > 0 || hasArticleRef;

      if (!isGrounded && quotedPhrases.length > 0) {
        issues.push({
          actor: actor.name,
          field: 'potentialConnections.evidence',
          message: `Evidence for "${conn.targetActor}" contains quoted text not found in the specific document sections provided for this candidate: "${quotedPhrases[0].substring(0, 60)}..."`,
        });
      } else if (!isGrounded && quotedPhrases.length === 0) {
        issues.push({
          actor: actor.name,
          field: 'potentialConnections.evidence',
          message: `Evidence for "${conn.targetActor}" lacks verbatim quotes from the document or specific references.`,
        });
      }

      // Check targetActor exists in existing network (fuzzy match)
      const targetLower = conn.targetActor.toLowerCase();
      const match = existingNodeLabels.some(label =>
        label.toLowerCase().includes(targetLower) || targetLower.includes(label.toLowerCase())
      );
      if (!match && existingNodeLabels.length > 0) {
        issues.push({
          actor: actor.name,
          field: 'potentialConnections.targetActor',
          message: `"${conn.targetActor}" not found in existing network. Available: ${existingNodeLabels.slice(0, 5).join(', ')}...`,
        });
      }
    });

    // V2 Validation: Validate Evidence Quotes
    if (actor.evidenceQuotes && actor.evidenceQuotes.length > 0) {
      actor.evidenceQuotes.forEach((eq, index) => {
        const quoteLower = eq.quote.toLowerCase();
        // Allow for minor spacing/punctuation differences in extraction
        const normalizedQuote = quoteLower.replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');
        const normalizedEvidence = actorEvidenceLower.replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');

        if (!normalizedEvidence.includes(normalizedQuote) && quoteLower.length > 10) {
          issues.push({
            actor: actor.name,
            field: `evidenceQuotes[${index}].quote`,
            message: `The extracted quote was not found as a verbatim substring in the provided document sections: "${eq.quote.substring(0, 60)}..."`,
          });
        }
      });
    }

    // Require new V2 structures for completeness
    if (!actor.claim || !actor.claim.fullReasoning) {
      issues.push({ actor: actor.name, field: 'claim', message: 'Missing structured claim object.' });
    }
    if (!actor.roster) {
      issues.push({ actor: actor.name, field: 'roster', message: 'Missing roster object.' });
    }
    if (!actor.missingSignals) {
      issues.push({ actor: actor.name, field: 'missingSignals', message: 'Missing signals array.' });
    }

    // Check absence strength justification (low-confidence heuristic:
    // a verbose but nonsensical reason would pass this check, but it
    // catches the most common failure mode of terse, unjustified scores)
    if (actor.absenceStrength !== undefined && actor.absenceStrength > 80 && actor.reason.length < 100) {
      issues.push({
        actor: actor.name,
        field: 'reason',
        message: `High absence strength (${actor.absenceStrength}) but reasoning is too short (${actor.reason.length} chars). Needs more justification.`,
      });
    }

    // Check required fields
    if (!actor.exclusionType) {
      issues.push({ actor: actor.name, field: 'exclusionType', message: 'Missing exclusionType field.' });
    }
    if (!actor.institutionalLogics) {
      issues.push({ actor: actor.name, field: 'institutionalLogics', message: 'Missing institutionalLogics field.' });
    }
    if (!actor.potentialConnections || actor.potentialConnections.length === 0) {
      issues.push({ actor: actor.name, field: 'potentialConnections', message: 'Missing potentialConnections array.' });
    }
  });

  return issues;
}


/**
 * Build a correction prompt for iterative refinement
 */
function buildCorrectionPrompt(
  issues: ValidationIssue[],
  previousResponse: string,
): string {
  const issueList = issues.map(i => `- ${i.actor}: ${i.field} — ${i.message}`).join('\n');
  return `Your previous ghost node analysis had the following quality issues:

${issueList}

Please revise your JSON response to address these issues. Specifically:
1. Ensure all evidence fields contain verbatim quotes from the document (use quotation marks around exact text)
2. Ensure all targetActor names exactly match actors listed in the existing network
3. Provide detailed reasoning for high absence strength scores (>80) — at minimum 100 characters
4. Include all required fields (exclusionType, institutionalLogics, potentialConnections)
5. Ensure the new V2 structured keys are completely populated: 
   - "evidenceQuotes": [{"quote": "...", "actors": [], "sourceRef": "..."}]
   - "claim": {"summaryBullets": [], "disambiguations": [], "fullReasoning": "..."}
   - "roster": {"actors": [], "mechanisms": []}
   - "missingSignals": [{"signal": "...", "searchTerms": []}]
6. Make sure the quotes in evidenceQuotes are perfect substrings of the provided document sections.

Previous response to revise:
${previousResponse.substring(0, 2000)}

Return the complete corrected JSON object with the same structure.`;
}

/**
 * Analyze institutional logics using AI and detect ghost nodes.
 * Uses a 3-stage multi-pass pipeline:
 *   Pass 1:   Broad scan (gpt-4o-mini) → 8-12 candidates with keywords
 *   Pass 1.5: Relevance scoring (code) → select top sections per candidate
 *   Pass 2:   Deep dive (gpt-4o) → full forensic analysis on top 5
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
  const nodesArray = Array.isArray(existingAnalysis.nodes)
    ? existingAnalysis.nodes
    : [];
  const existingLabels = nodesArray.map(n => n.label || n.id || '').filter(Boolean);

  // Parse user-provided expected actors
  const parsedUserActors = parseUserExpectedActors(userExpectedActors);
  if (parsedUserActors.length > 0) {
    console.warn(`[GHOST_NODES] User-provided actors: ${parsedUserActors.length} items:`, parsedUserActors);
  }

  try {
    // =========================================================================
    // STAGE 0: Parse document into structured sections
    // =========================================================================
    console.warn('[GHOST_NODES] === MULTI-PASS PIPELINE START ===');
    console.warn('[GHOST_NODES] Document type:', documentType);
    console.warn('[GHOST_NODES] Document length:', text.length, 'chars');
    console.warn('[GHOST_NODES] Existing nodes:', nodesArray.length);

    const parsedDoc = parseDocumentSections(text);
    console.warn(`[GHOST_NODES] Stage 0: Parsed ${parsedDoc.sections.length} sections (confidence: ${(parsedDoc.parsingConfidence * 100).toFixed(0)}%)`);

    if (parsedDoc.parsingConfidence < 0.2) {
      console.warn('[GHOST_NODES] Low parsing confidence — document may lack structural markers. Using paragraph fallback.');
    }

    // Format sections for Pass 1 prompt (generous budget for broad scan)
    const structuredTextForPass1 = formatSectionsForPrompt(parsedDoc.sections, 16000);

    // =========================================================================
    // PASS 1: Broad Scan (gpt-4o-mini — cheap, fast)
    // =========================================================================
    const pass1Prompt = buildPass1Prompt(structuredTextForPass1, existingLabels, documentType, parsedUserActors);
    console.warn('[GHOST_NODES] Pass 1: Sending broad scan to gpt-4o-mini...');
    console.warn('[GHOST_NODES] Pass 1 prompt length:', pass1Prompt.length, 'chars');

    const pass1Completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a policy analysis assistant. Identify absent or marginalized actor types in policy documents. Return valid JSON only.",
        },
        { role: "user", content: pass1Prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1500,
    });

    const pass1Text = pass1Completion.choices[0]?.message?.content || "{}";
    const pass1Result = JSON.parse(pass1Text);
    const candidates: CandidateActor[] = pass1Result.candidates || [];

    console.warn(`[GHOST_NODES] Pass 1: Found ${candidates.length} candidates`);
    candidates.forEach((c, i) => {
      console.warn(`[GHOST_NODES]   ${i + 1}. "${c.name}" (score: ${c.absenceStrength}, keywords: ${c.keywords?.join(', ') || 'none'})`);
    });

    if (candidates.length === 0) {
      console.warn('[GHOST_NODES] Pass 1 returned no candidates. Returning empty ghost nodes.');
      const ghostNodes = detectGhostNodes(nodesArray, undefined, documentType);
      return { ghostNodes };
    }

    // =========================================================================
    // PASS 1.5: NegEx Detection + Relevance Scoring (code-only, no API)
    // =========================================================================

    // --- NegEx: Detect explicit exclusions in document text ---
    const exclusionMap = detectExplicitExclusions(text, candidates);
    if (exclusionMap.size > 0) {
      console.warn('[GHOST_NODES] NegEx: Explicit exclusions detected:',
        Object.fromEntries([...exclusionMap].map(([k, v]) => [
          k, v.map(m => `${m.confidence}: "${m.trigger}"`).join(', ')
        ]))
      );
      // Attach exclusions to candidates and apply relative boost
      for (const candidate of candidates) {
        const matches = exclusionMap.get(candidate.name);
        if (matches && matches.length > 0) {
          candidate.explicitExclusions = matches;
          const hasStrong = matches.some(m => m.confidence === 'strong');
          const boost = hasStrong
            ? 0.15 * (100 - (candidate.absenceStrength || 0))  // Strong: +15% of headroom
            : 0.08 * (100 - (candidate.absenceStrength || 0)); // Weak: +8% of headroom
          candidate.absenceStrength = Math.min(100, Math.round((candidate.absenceStrength || 0) + boost));
          console.warn(`[GHOST_NODES] NegEx: Boosted "${candidate.name}" → ${candidate.absenceStrength} (${hasStrong ? 'strong' : 'weak'} match)`);
        }
      }
    } else {
      console.warn('[GHOST_NODES] NegEx: No explicit exclusions found in document text.');
    }

    // --- Pass 0.5: Dominant Discourse Extraction ---
    console.warn('[GHOST_DEBUG] Starting Pass 0.5 Dominant Discourse Extraction...');
    const dominantDiscourses = await extractDominantDiscourses(openai, structuredTextForPass1);
    console.warn('[GHOST_DEBUG] Pass 0.5 complete. Discourses:', dominantDiscourses);

    // --- Sort candidates by absenceStrength descending, take top N ---
    const sortedCandidates = [...candidates]
      .sort((a, b) => (b.absenceStrength || 0) - (a.absenceStrength || 0))
      .slice(0, MAX_DEEP_DIVE_CANDIDATES);

    console.warn(`[GHOST_NODES] Pass 1.5: Selecting top ${sortedCandidates.length} candidates for deep dive`);

    const candidateSections = scoreAndSelectSections(sortedCandidates, parsedDoc.sections);

    // Log section selection results
    for (const [candidateName, sections] of Array.from(candidateSections.entries())) {
      const sectionTags = sections.map(s => s.tag).join(', ');
      console.warn(`[GHOST_NODES] Pass 1.5: "${candidateName}" → ${sections.length} sections [${sectionTags}]`);
    }

    // PASS 2: Deep Forensic Analysis (gpt-4o — full model)
    // =========================================================================
    const pass2Prompt = buildPass2Prompt(sortedCandidates, candidateSections, existingLabels, documentType, parsedDoc.sections, dominantDiscourses);
    console.warn('[GHOST_DEBUG] Pass 2 Prompt length:', pass2Prompt.length);

    const pass2Completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in Actor-Network Theory and institutional logics specializing in policy forensics. You MUST return a complete JSON object containing exactly three top-level keys: 'institutionalLogics' (object), 'absentActors' (array), and 'methodologicalNotes' (string). NEVER return an empty JSON object. Evidence should be based on the provided text. All targetActor names must exactly match actors from the existing network.",
        },
        { role: "user", content: pass2Prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_completion_tokens: 16384,
    });

    console.warn('[GHOST_DEBUG] Pass 2 Completion full:', JSON.stringify(pass2Completion.choices[0]));
    let responseText = pass2Completion.choices[0]?.message?.content || "{}";

    // Write to a persistent debug log
    const logPath = 'c:\\Users\\mount\\.gemini\\antigravity\\scratch\\ghost_debug.log';
    const logEntry = `\n\n--- [${new Date().toISOString()}] ---\nSOURCE: ${documentType}\nPROMPT:\n${pass2Prompt}\n\nRESPONSE:\n${responseText}\n`;
    try { fs.appendFileSync(logPath, logEntry); } catch (_e) { }

    console.warn('[GHOST_DEBUG] Pass 2 Raw Response:', responseText);
    let result = JSON.parse(responseText);
    console.warn('[GHOST_NODES] Pass 2 result keys:', Object.keys(result));

    // =========================================================================
    // TWO-TIER EMPTY-RESPONSE RETRY
    // =========================================================================
    if (Object.keys(result).length === 0) {
      console.warn('[GHOST_NODES] ⚠️ Pass 2 returned empty {}. Starting retry tier 1 (temp 0.5)...');
      try {
        const retry1Completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You MUST return a complete JSON object with three keys: 'institutionalLogics', 'absentActors' (array), and 'methodologicalNotes' (string). Analyze the candidates provided and return your forensic analysis. NEVER return an empty object.",
            },
            { role: "user", content: pass2Prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_completion_tokens: 16384,
        });
        console.warn('[GHOST_DEBUG] Retry 1 Completion full:', JSON.stringify(retry1Completion.choices[0]));
        const retry1Text = retry1Completion.choices[0]?.message?.content || "{}";
        result = JSON.parse(retry1Text);
        responseText = retry1Text;
        console.warn('[GHOST_NODES] Retry tier 1 result keys:', Object.keys(result));

        // Write retry to debug log
        try { fs.appendFileSync(logPath, `\n[RETRY-1 @ ${new Date().toISOString()}] RESPONSE:\n${retry1Text}\n`); } catch (_e) { }
      } catch (retryErr) {
        console.error('[GHOST_NODES] Retry tier 1 failed:', retryErr);
      }
    }

    if (Object.keys(result).length === 0) {
      console.warn('[GHOST_NODES] ⚠️ Retry tier 1 still empty. Starting retry tier 2 (temp 0.7, simplified prompt)...');
      try {
        const simplifiedPrompt = `# Absent Actor Analysis\n\nAnalyze these candidates for absence from a ${documentType} document.\n\nExisting actors in the network: ${existingLabels.join(', ')}\n\nCandidates:\n${sortedCandidates.map(c => `- "${c.name}": ${c.reason} (score: ${c.absenceStrength})`).join('\n')}\n\nReturn JSON with:\n- "institutionalLogics": { "market": {"strength": 0.5, "champions": [], "material": "", "discursive": ""}, "state": {...}, "professional": {...}, "community": {...} }\n- "absentActors": array of { "name", "absenceType" (structural-exclusion/textual-absence/discursive-marginalization/constitutive-silence), "reason" (detailed), "absenceStrength" (0-100), "exclusionType" (silenced/marginalized/structurally-excluded/displaced), "institutionalLogics": {market,state,professional,community as 0-1}, "potentialConnections": [{"targetActor","relationshipType","evidence"}], "evidenceQuotes": [{"quote": "...", "actors": [], "sourceRef": "..."}], "claim": {"summaryBullets": [], "disambiguations": [], "fullReasoning": "..."}, "roster": {"actors": [], "mechanisms": []}, "missingSignals": [{"signal": "...", "searchTerms": []}] }\n- "methodologicalNotes": string\n\nYou MUST return all three keys. Include at least 1 absent actor.`;


        const retry2Completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a policy analysis expert. You MUST return a JSON object containing exactly three top-level keys: 'institutionalLogics' (object), 'absentActors' (array), and 'methodologicalNotes' (string). NEVER return an empty JSON object.",
            },
            { role: "user", content: simplifiedPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_completion_tokens: 16384,
        });
        console.warn('[GHOST_DEBUG] Retry 2 Completion full:', JSON.stringify(retry2Completion.choices[0]));
        const retry2Text = retry2Completion.choices[0]?.message?.content || "{}";
        result = JSON.parse(retry2Text);
        responseText = retry2Text;
        console.warn('[GHOST_NODES] Retry tier 2 result keys:', Object.keys(result));

        // Write retry to debug log
        try { fs.appendFileSync(logPath, `\n[RETRY-2 @ ${new Date().toISOString()}] RESPONSE:\n${retry2Text}\n`); } catch (_e) { }
      } catch (retryErr) {
        console.error('[GHOST_NODES] Retry tier 2 failed:', retryErr);
      }
    }

    if (Object.keys(result).length === 0) {
      console.error('[GHOST_NODES] 🚨 CRITICAL: All retries returned empty. Using fallback ghost node detection.');
      const fallbackGhosts = detectGhostNodes(nodesArray, undefined, documentType);
      return { ghostNodes: fallbackGhosts };
    }
    console.warn('[GHOST_NODES] Pass 2 absentActors count:', result.absentActors?.length || 0);

    if (dominantDiscourses.length > 0) {
      const discourseText = `\n\nPrimary discourses analyzed: ${dominantDiscourses.join(', ')}.`;
      if (result.methodologicalNotes) {
        result.methodologicalNotes += discourseText;
      } else {
        result.methodologicalNotes = discourseText.trim();
      }
    }

    if (result.methodologicalNotes) {
      console.warn('[GHOST_NODES] Methodological notes:', result.methodologicalNotes);
    }

    // =========================================================================
    // POST-RESPONSE VALIDATION & ITERATIVE REFINEMENT
    // =========================================================================
    if (result.absentActors && Array.isArray(result.absentActors)) {
      const issues = validateGhostNodeResponse(result.absentActors, existingLabels, text, candidateSections);

      if (issues.length > 0) {
        console.warn(`[GHOST_NODES] Validation found ${issues.length} issues:`);
        issues.forEach(i => console.warn(`[GHOST_NODES]   - ${i.actor}.${i.field}: ${i.message}`));

        // Iterative refinement: retry if >2 issues
        if (issues.length > 2) {
          console.warn('[GHOST_NODES] Too many issues, requesting AI correction...');
          try {
            const correctionPrompt = buildCorrectionPrompt(issues, responseText);
            const retryCompletion = await openai.chat.completions.create({
              model: process.env.OPENAI_MODEL || "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: "You are revising a ghost node analysis. Fix the identified quality issues and return corrected JSON. All evidence must contain verbatim quotes. All targetActor names must match the existing network.",
                },
                { role: "user", content: correctionPrompt },
              ],
              response_format: { type: "json_object" },
              max_completion_tokens: 4000,
            });

            const retryText = retryCompletion.choices[0]?.message?.content || "{}";
            const retryResult = JSON.parse(retryText);

            if (retryResult.absentActors && retryResult.absentActors.length > 0) {
              const retryIssues = validateGhostNodeResponse(retryResult.absentActors, existingLabels, text, candidateSections);
              console.warn(`[GHOST_NODES] Retry validation: ${retryIssues.length} issues (was ${issues.length})`);

              if (retryIssues.length < issues.length) {
                console.warn('[GHOST_NODES] Retry improved quality, using corrected response');
                result = retryResult;
                responseText = retryText;
              } else {
                console.warn('[GHOST_NODES] Retry did not improve, keeping original response');
              }
            }
          } catch (retryError) {
            console.warn('[GHOST_NODES] Retry failed, using original response:', retryError);
          }
        }
      } else {
        console.warn('[GHOST_NODES] Validation passed — no issues found');
      }
    }

    // =========================================================================
    // GHOST NODE ASSEMBLY
    // =========================================================================
    if (result.absentActors && result.absentActors.length > 0) {
      console.warn('[GHOST_NODES] First absent actor fields:', Object.keys(result.absentActors[0]));
      console.warn('[GHOST_NODES] First absent actor sample:', JSON.stringify(result.absentActors[0]).substring(0, 300));
    }

    console.warn('[GHOST_NODES] Assembling ghost nodes for', nodesArray.length, 'existing nodes');

    // Detect ghost nodes using the institutional logics (currently returns empty — all nodes come from AI)
    const ghostNodes = detectGhostNodes(
      nodesArray,
      result.institutionalLogics,
      documentType,
    );

    // Process AI-generated absent actors into ghost nodes
    console.warn('[GHOST_NODES] AI returned', result.absentActors?.length || 0, 'absent actors');

    if (result.absentActors && Array.isArray(result.absentActors)) {
      result.absentActors.forEach(
        (absentActor: AbsentActorResponse, index: number) => {
          // Check for duplicates with existing nodes AND already-added ghost nodes
          const allNodes = [...nodesArray, ...ghostNodes.map(gn => ({ label: gn.label, id: gn.id }))];
          if (isDuplicateConcept(absentActor.name, allNodes)) {
            console.warn(`[GHOST_NODES] Filtering duplicate: "${absentActor.name}" matches existing node or ghost`);
            return;
          }

          const ghostNodeIndex = ghostNodes.findIndex(
            (gn) =>
              gn.label.toLowerCase().includes(absentActor.name.toLowerCase()) ||
              absentActor.name.toLowerCase().includes(gn.label.toLowerCase()),
          );

          if (ghostNodeIndex !== -1) {
            // Update existing ghost node with AI explanation and connections
            console.warn(`[GHOST_NODES] Updating ghost node "${ghostNodes[ghostNodeIndex].label}" with AI data`);
            ghostNodes[ghostNodeIndex].ghostReason = absentActor.reason;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ghostNodes[ghostNodeIndex] as any).whyAbsent = absentActor.reason;
            ghostNodes[ghostNodeIndex].potentialConnections =
              absentActor.potentialConnections || [];
            if (absentActor.absenceStrength !== undefined) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (ghostNodes[ghostNodeIndex] as any).absenceStrength = absentActor.absenceStrength;
            }
            if (absentActor.exclusionType) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (ghostNodes[ghostNodeIndex] as any).exclusionType = absentActor.exclusionType;
            }
            if (absentActor.institutionalLogics) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (ghostNodes[ghostNodeIndex] as any).institutionalLogics = absentActor.institutionalLogics;
            }
            if (absentActor.discourseThreats?.length) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (ghostNodes[ghostNodeIndex] as any).discourseThreats = absentActor.discourseThreats;
            }
            // V2 Data Assignment
            if (absentActor.evidenceQuotes?.length) {
              ghostNodes[ghostNodeIndex].evidenceQuotes = absentActor.evidenceQuotes;
            }
            if (absentActor.claim) {
              ghostNodes[ghostNodeIndex].claim = absentActor.claim;
            }
            if (absentActor.roster) {
              ghostNodes[ghostNodeIndex].roster = absentActor.roster;
            }
            if (absentActor.missingSignals?.length) {
              ghostNodes[ghostNodeIndex].missingSignals = absentActor.missingSignals;
            }

          } else {
            // Add new ghost node from AI analysis
            console.warn(`[GHOST_NODES] Adding new AI ghost node: "${absentActor.name}"`);
            ghostNodes.push({
              id: `ghost-ai-${index}`,
              label: absentActor.name,
              category: "Expected Actor",
              description: `This actor type is notably absent from the policy network.`,
              ghostReason: absentActor.reason,
              whyAbsent: absentActor.reason,
              isGhost: true,
              color: "#9333EA",
              evidence: absentActor.evidence || [{ rationale: absentActor.reason }],
              potentialConnections: absentActor.potentialConnections || [],
              ...(absentActor.absenceStrength !== undefined && { absenceStrength: absentActor.absenceStrength }),
              ...(absentActor.exclusionType && { exclusionType: absentActor.exclusionType }),
              ...(absentActor.absenceType && { absenceType: absentActor.absenceType }),
              ...(absentActor.institutionalLogics && { institutionalLogics: absentActor.institutionalLogics }),
              ...(absentActor.discourseThreats?.length && { discourseThreats: absentActor.discourseThreats }),
              ...(absentActor.evidenceQuotes?.length && { evidenceQuotes: absentActor.evidenceQuotes }),
              ...(absentActor.claim && { claim: absentActor.claim }),
              ...(absentActor.roster && { roster: absentActor.roster }),
              ...(absentActor.missingSignals?.length && { missingSignals: absentActor.missingSignals }),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
          }
        },
      );
    }

    console.warn(`[GHOST_NODES] === MULTI-PASS PIPELINE COMPLETE: ${ghostNodes.length} ghost nodes ===`);

    return {
      ghostNodes,
      institutionalLogics: result.institutionalLogics,
      methodologicalNotes: result.methodologicalNotes,
      dominantDiscourses,
      ...(parsedUserActors.length > 0 && { userActorsUsed: parsedUserActors }),
    };
  } catch (error) {
    console.error("[GHOST_NODES] Ghost node detection error:", error);
    console.error("[GHOST_NODES] Error details:", JSON.stringify(error, null, 2));
    // Fallback: detect ghost nodes without AI analysis
    const ghostNodes = detectGhostNodes(nodesArray, undefined, documentType);
    return { ghostNodes };
  }
}

