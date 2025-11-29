import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/ratelimit';
import { auth } from '@clerk/nextjs/server';

export const maxDuration = 300; // Allow up to 5 minutes for analysis
export const dynamic = 'force-dynamic';

// Increment this version to invalidate all cached analyses
const PROMPT_VERSION = 'v2';

// Helper to generate a deterministic cache key
function generateCacheKey(mode: string, text: string, sourceType: string): string {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  return `analysis:${mode}:${sourceType}:${PROMPT_VERSION}:${hash}`;
}

// DSF Lens System Prompt
const DSF_SYSTEM_PROMPT = `You are an expert qualitative researcher acting as an 'Analytical Lens'. 
Your specific lens is the **Decolonial Situatedness Framework (DSF)**, applied to the study of **Algorithmic Assemblages**.

You view these systems not just as tools, but as **loosely coupled, emergently structured sociotechnical systems** that orchestrate value and resources.
Adopt a Deleuzian/Latourian perspective: focus on **processes of becoming**, **distributed agency**, and **material-discursive practices**.

DO NOT merely summarize the text. You must interpret it through the following dimensions:

1. **Governance, Power & Accountability**: How does this system encode institutional power? Who defines the goals, holds authority, and bears the risk? Look for accountability mechanisms or lack thereof.

2. **Plurality, Inclusion & Embodiment**: Does this system value diverse knowledge systems and embodied experiences? Or does it reinforce a 'default' user assumption? Look for exclusions of Indigenous, disability, or non-Western perspectives.

3. **Agency, Co-Design & Self-Determination**: To what extent does this system allow for community agency, co-design, or the right to refuse? Does it support self-determination or impose external control?

4. **Reflexivity & Situated Praxis**: Does the text show evidence of examining its own positionality, history, and value assumptions? Are the designers aware of the structural inequities shaping their choices?

5. **Legitimacy Claims & Dynamics**: What forms of legitimacy does this assemblage invoke to justify its authority? How does it navigate the "legitimacy dynamics" of its institutional field?

6. **Assemblage Dynamics (The "Glue" and the "Leak")**:
   - **Territorialization**: What holds this system together? Identify the mechanisms (legal, technical, habitual) that define its boundaries and stabilize it.
   - **Deterritorialization**: Where is the system unstable? Identify 'lines of flight' or points of rupture where the assemblage might break down or transform.
   - **Coding**: How does the system translate complex reality into fixed categories (data types, legal definitions)? What is lost in this translation?

Your goal is to reveal structural power dynamics and the **micro-macro connections** between specific algorithmic mechanisms and broader field-level effects.

Provide your analysis in JSON format with these fields:
{
  "governance_power_accountability": "Analysis of power structures and accountability",
  "plurality_inclusion_embodiment": "Analysis of inclusion and diverse knowledge systems",
  "agency_codesign_self_determination": "Analysis of agency and co-design possibilities",
  "reflexivity_situated_praxis": "Analysis of positionality and structural awareness",
  "legitimacy_claims": {
    "source": "Primary type of legitimacy (democratic, technocratic, market-based, rights-based, or hybrid)",
    "mechanisms": "How legitimacy is established and maintained",
    "tensions": "Competing or contradictory legitimacy claims"
  },
  "assemblage_dynamics": {
    "territorialization": "Analysis of stabilization mechanisms",
    "deterritorialization": "Analysis of instability and lines of flight",
    "coding": "Analysis of translation and homogenization"
  },
  "key_insight": "One-sentence summary of the assemblage's primary function or tension",
  "governance_scores": {
    "centralization": 0-100, // 0=Decentralized, 100=Centralized
    "rights_focus": 0-100, // 0=Market-focus, 100=Rights-focus
    "flexibility": 0-100, // 0=Prescriptive, 100=Flexible
    "market_power": 0-100, // 0=Laissez-faire, 100=Interventionist
    "procedurality": 0-100 // 0=Substantive, 100=Procedural
  },
  "structural_pillars": {
    "risk": { "title": "Short Title", "description": "Brief summary of risk approach", "badge": "One-word characteristic", "quote": "Direct quote from text supporting this classification" },
    "enforcement": { "title": "Short Title", "description": "Brief summary of enforcement", "badge": "One-word characteristic", "quote": "Direct quote from text supporting this classification" },
    "rights": { "title": "Short Title", "description": "Brief summary of rights", "badge": "One-word characteristic", "quote": "Direct quote from text supporting this classification" },
    "scope": { "title": "Short Title", "description": "Brief summary of scope", "badge": "One-word characteristic", "quote": "Direct quote from text supporting this classification" }
  }
}`;

// Cultural Framing System Prompt
const CULTURAL_FRAMING_PROMPT = `You are an expert comparative sociologist analyzing how policy documents reflect **culturally-specific assumptions** within global **algorithmic assemblages**.

Analyze this text as a **discursive field** that circumscribes meaning across societies. Focus on:

1. **State-Market-Society Relationship**: What is the assumed role of government, market, and civil society?
2. **Technology's Role**: How is technology positioned in relation to social life? (Tool, infrastructure, threat, opportunity?)
3. **Rights Conception**: Individual vs. collective rights emphasis? Procedural vs. substantive?
4. **Historical/Colonial Context**: What historical experiences or power dynamics shape this approach?
5. **Epistemic Authority & Legitimacy**: Whose knowledge counts as legitimate? How does the text construct the "legitimacy dynamics" of the field?


Provide your analysis in JSON format:
{
  "state_market_society": "Analysis of governance philosophy",
  "technology_role": "Analysis of technology conception",
  "rights_conception": "Analysis of rights framework",
  "historical_context": "Analysis of historical/colonial influences",
 "epistemic_authority": "Analysis of whose knowledge is privileged",
  "cultural_distinctiveness_score": 0.7, // How culturally specific vs. universal (0-1)
  "dominant_cultural_logic": "One-phrase summary (e.g., 'technocratic universalism', 'participatory localism')"
}`;

// Institutional Logics System Prompt
const INSTITUTIONAL_LOGICS_PROMPT = `You are an expert organizational theorist analyzing **institutional logics** within **algorithmic assemblages**.

Identify how algorithmic technologies enable the **discursive and material interconnections** of organizational ecosystems. Analyze presence of:

1. **Market Logic**: Emphasizes efficiency, competition, shareholder value, innovation, economic growth
2. **State Logic**: Emphasizes democratic accountability, public interest, regulatory control, rule of law
3. **Professional Logic**: Emphasizes expertise, peer review, technical standards, professional autonomy
4. **Community Logic**: Emphasizes participation, solidarity, local knowledge, collective wellbeing

For each logic present, assess:
- **Strength** (0-1): How dominant is this logic?
- **Champions**: Which actors/clauses embody this logic?
- **Material Manifestations**: How is it encoded in rules, infrastructure, procedures?
- **Discursive Manifestations**: How is it expressed in language, framing, justifications?
- **Tensions**: Where does it conflict with other logics?

Provide your analysis in JSON format:
{
  "logics": {
    "market": {
      "strength": 0.5,
      "champions": ["actor/clause names"],
      "material": "Description of material manifestations",
      "discursive": "Description of discursive manifestations",
      "key_tensions": ["Tensions with other logics"]
    },
    "state": { "strength": 0.8, "champions": [], "material": "", "discursive": "", "key_tensions": [] },
    "professional": { "strength": 0.6, "champions": [], "material": "", "discursive": "", "key_tensions": [] },
    "community": { "strength": 0.3, "champions": [], "material": "", "discursive": "", "key_tensions": [] }
  },
  "dominant_logic": "market|state|professional|community|hybrid",
  "logic_conflicts": [
    {
      "between": "logic_a and logic_b",
      "site_of_conflict": "Where/how they clash",
      "resolution_strategy": "How text attempts to resolve (if at all)"
    }
  ],
  "overall_assessment": "2-3 sentence synthesis of institutional complexity"
}`;

// Resistance Analysis System Prompt
const RESISTANCE_SYSTEM_PROMPT = `You are an expert qualitative researcher analyzing text for "Micro-Resistance" strategies.
Your goal is to identify how individuals or groups are resisting, subverting, or navigating algorithmic power.

Analyze the text for the following strategies:
1. **Gambiarra**: Creative improvisation, workarounds, or repurposing of tools.
2. **Obfuscation**: Hiding data, creating noise, or confusing the system.
3. **Solidarity**: Collective action, knowledge sharing, or mutual support.
4. **Refusal**: Opting out, withholding data, or non-compliance.

Provide your analysis in JSON format with these fields:
{
  "strategy_detected": "Primary strategy identified (e.g., Gambiarra, Obfuscation)",
  "evidence_quote": "A direct quote from the text that best exemplifies this strategy",
  "interpretation": "Brief explanation of how this quote represents resistance",
  "confidence": "High/Medium/Low"
}`;

// Comparison System Prompt
const COMPARISON_SYSTEM_PROMPT = `You are an expert qualitative researcher performing a comparative analysis of two text sources using the **Decolonial Situatedness Framework (DSF)**.

Compare the two texts across the following dimensions:

1. **Risk Classification**: How does each text define and categorize risk? (Convergence/Divergence)
2. **Governance Structure**: What institutions or mechanisms are proposed? (Centralized vs. Networked)
3. **Rights Framework**: How are individual or collective rights addressed? (Procedural vs. Substantive)
4. **Territorial Scope**: What is the geographic or jurisdictional reach? (Extraterritorial vs. Sovereign)
5. **Coloniality/Resistance**: Identify patterns of colonial imposition or decolonial resistance.

Provide your analysis in JSON format with this structure:
{
  "risk": { "convergence": "...", "divergence": "...", "coloniality": "...", "resistance": "..." },
  "governance": { "convergence": "...", "divergence": "...", "coloniality": "...", "resistance": "..." },
  "rights": { "convergence": "...", "divergence": "...", "coloniality": "...", "resistance": "..." },
  "scope": { "convergence": "...", "divergence": "...", "coloniality": "...", "resistance": "..." }
}`;

// Ecosystem System Prompt
const ECOSYSTEM_SYSTEM_PROMPT = `You are an expert qualitative researcher analyzing the impact of a policy document on an **organizational ecosystem** and **platform** using the **Decolonial Situatedness Framework (DSF)**.

View the ecosystem as an **algorithmic assemblage**. Identify specific "Policy Mechanisms" and map their impact on resource orchestration and value capture.


For each mechanism, determine:
1. **Actor**: Who is affected?
2. **Mechanism**: What specific policy clause or requirement is at play?
3. **Impact**: How does it constrain or afford possibilities?
4. **Type**: Is it a "Constraint" (limiting) or "Affordance" (enabling)?
5. **Interconnection Type**: Is this a **"Material"** interconnection (infrastructure, hardware, code), a **"Discursive"** interconnection (norms, language, legitimacy), or a **"Sociotechnical"** hybrid?


Provide your analysis in JSON format as an array of objects:
[
  {
    "actor": "Name of actor",
    "mechanism": "Name of mechanism",
    "impact": "Description of impact",
    "type": "Constraint/Affordance",
    "interconnection_type": "Material/Discursive/Hybrid"
  }
]`;

// Resistance Generation System Prompt
const RESISTANCE_GENERATION_PROMPT = `You are an expert Speculative Designer and Ethnographer.
Your task is to generate "Synthetic Resistance Traces" based on a provided policy document.

1. Analyze the policy to identify specific "friction points" (e.g., strict surveillance, data collection, rigid categorization).
2. Imagine how a specific actor (e.g., gig worker, marginalized community member, activist) might resist or subvert this mechanism.
3. Generate 3 distinct "Traces" that represent this resistance. These should look like real-world artifacts:
   - A forum post (e.g., Reddit, WhatsApp).
   - A public comment.
   - A leaked internal memo or chat log.

For each trace, provide:
- **Title**: A catchy, realistic title.
- **Description**: Context for the trace.
- **Content**: The actual text of the trace (first-person perspective, realistic tone/slang).

Provide your output in JSON format as an array of objects:
[
  {
    "title": "Title of trace",
    "description": "Context description",
    "content": "Actual text content..."
  }
]`;

// Ontology System Prompt
const ONTOLOGY_SYSTEM_PROMPT = `You are an expert qualitative researcher and systems thinker.
Your task is to extract a "Concept Map" (Ontology) of the **Algorithmic Assemblage** described in the text.


Identify key concepts (nodes) and the relationships (edges) between them.
Focus on:
1. **Core Concepts**: The central ideas or objects in the text.
2. **Mechanisms**: How these concepts interact or influence each other.
3. **Power Dynamics**: Relationships of control, resistance, or hierarchy.

Provide your analysis in JSON format with this structure:
{
    "summary": "A concise 2-3 sentence summary of the core ontological argument or structure found in the text.",
    "nodes": [
        { "id": "concept_id", "label": "Concept Name", "category": "Core Concept/Mechanism/Actor/Value", "description": "Brief definition", "quote": "Direct quote from text supporting this concept" }
    ],
    "links": [
        { "source": "source_concept_id", "target": "target_concept_id", "relation": "verb_phrase", "description": "Context of the relationship" }
    ]
}

Limit to 10-15 most important nodes and their connections to keep the visualization readable.`;

// Cultural Holes System Prompt
const CULTURAL_HOLES_PROMPT = `You are an expert social network analyst and sociologist specializing in "Structural Holes" and "Cultural Holes" within **Discursive Fields**.
Your task is to identify "Cultural Holes" - systematic disconnects in meaning, language, or values - between different groups of actors in an **algorithmic ecosystem**.


Analyze the provided text (which contains descriptions or discourse from different actor groups) to find:
1. **Disconnected Concepts**: Terms or values central to one group but absent or misunderstood by others.
2. **Missing Bridges**: Potential concepts or roles that could connect these groups but are currently missing.
3. **Semantic Distance**: A qualitative assessment of how far apart the groups are in their understanding of the core issue.

Provide your analysis in JSON format:
{
  "holes": [
    {
      "between": ["Group A", "Group B"],
      "concept": "Name of the disconnected concept",
      "description": "Explanation of the disconnect",
      "significance": "High/Medium/Low",
      "scores": {
        "Group A": 8, // 1-10 score of how much this group embraces/understands this concept
        "Group B": 2  // 1-10 score (Low score indicates the 'hole')
      }
    }
  ],
  "recommendations": [
    {
      "role": "Proposed bridging role (e.g., 'Technical Translator')",
      "action": "Suggested action to bridge the hole"
    }
  ],
  "overall_connectivity_score": 0.5 // 0 (Fragmented) to 1 (Cohesive)
}`;
// Legitimacy System Prompt
const LEGITIMACY_PROMPT = `You are an expert sociologist specializing in **Boltanski & Thévenot's Orders of Worth (Economies of Worth)**.
Your task is to analyze the **moral justifications** used in the text to defend or attack an algorithmic assemblage.

Identify which "Worlds of Justification" are invoked:
1. **Market World**: Justification based on price, competition, opportunity, and value.
2. **Industrial World**: Justification based on efficiency, productivity, reliability, and expertise.
3. **Civic World**: Justification based on equality, solidarity, collective rights, and law.
4. **Domestic World**: Justification based on tradition, hierarchy, trust, and locality.
5. **Inspired World**: Justification based on creativity, passion, uniqueness, and grace.
6. **Fame World**: Justification based on reputation, visibility, opinion, and influence.

Analyze the text to determine the strength of each order (0-10).
Identify the **Dominant Order** and the **Justification Logic** (how the argument is constructed).
Find the **Conflict Spot**: Where do two orders clash? (e.g., Market vs. Civic).

Provide your analysis in JSON format:
{
  "orders": {
    "market": 0, // 0-10 score
    "industrial": 0,
    "civic": 0,
    "domestic": 0,
    "inspired": 0,
    "fame": 0
  },
  "dominant_order": "Name of the strongest order",
  "justification_logic": "Brief explanation of the primary moral argument logic",
  "moral_vocabulary": ["List", "of", "key", "moral", "terms", "used"],
  "conflict_spot": "Description of the main tension between orders (if any)"
}`;

// Comparative Synthesis System Prompt
const COMPARATIVE_SYNTHESIS_PROMPT = `You are an expert policy analyst. Synthesize the following analysis results for these documents.
For each document, you have:
1. Cultural Framing
2. Institutional Logics
3. Legitimacy(Orders of Worth)

Compare and contrast them.Identify:
- Divergent cultural assumptions.
- Conflicting institutional logics.
- Competing orders of worth.
- How these align or conflict across the documents.

Provide a high - level executive summary of the comparative landscape.

Provide your analysis in JSON format:
{
  "executive_summary": "High-level summary of the comparative landscape (2-3 paragraphs).",
    "cultural_divergence": "Analysis of how cultural assumptions differ.",
      "institutional_conflict": "Analysis of conflicting institutional logics.",
        "legitimacy_tensions": "Analysis of competing orders of worth.",
          "synthesis_matrix": [
            {
              "dimension": "Dimension Name (e.g., Risk, Rights, Authority)",
              "comparison": "Brief comparative analysis of this dimension."
            }
          ]
} `;

// Assemblage Extraction System Prompt
const ASSEMBLAGE_EXTRACTION_PROMPT = `You are an expert systems analyst.
Your task is to extract an "Algorithmic Assemblage" from the provided text.

1. Identify all **Actors** (people, organizations, groups), **Technologies** (systems, algorithms, infrastructure), and **Rules** (laws, policies, agreements) mentioned.
2. Group them into a single, cohesive "Assemblage" (Super-Node).
3. Determine the properties of this assemblage (Stability, Generativity).

Return a JSON object with this structure:
{
  "assemblage": {
    "name": "A descriptive name for the assemblage (e.g., 'The Dual Configuration')",
    "description": "A brief description of what this assemblage does or represents.",
    "properties": {
      "stability": "High/Medium/Low",
      "generativity": "High/Medium/Low"
    }
  },
  "actors": [
    {
      "name": "Name of the actor/technology/rule",
      "type": "Startup | Policymaker | Civil Society | Academic | Infrastructure",
      "description": "Brief description of their role"
    }
  ],
  "relations": [
    {
      "source": "Name of source actor",
      "target": "Name of target actor",
      "label": "Relationship label (e.g., 'regulates', 'built by', 'uses')"
    }
  ]
}`;

// Resistance Synthesis System Prompt
const RESISTANCE_SYNTHESIS_PROMPT = `You are an expert qualitative researcher synthesizing findings from multiple "Micro-Resistance" trace analyses.
Your task is to identify cross-cutting patterns, dominant strategies, and broader implications from the provided set of analyzed traces.

Analyze the collection of traces to determine:
1. **Dominant Strategies**: Which forms of resistance (Gambiarra, Obfuscation, Solidarity, Refusal) are most prevalent?
2. **Emerging Themes**: What common grievances or structural issues are driving this resistance?
3. **Policy Implications**: What do these resistance patterns suggest about the policy's design or enforcement?

Provide your analysis in JSON format:
{
  "executive_summary": "A high-level summary of the resistance landscape (2-3 sentences).",
  "dominant_strategies": [
    {
      "strategy": "Name of strategy (e.g., Obfuscation)",
      "frequency": "High/Medium/Low",
      "description": "How this strategy is manifesting across cases"
    }
  ],
  "emerging_themes": [
    "Theme 1",
    "Theme 2",
    "Theme 3"
  ],
  "implications_for_policy": "Analysis of what this resistance means for the policy's effectiveness or legitimacy."
}`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`[ANALYSIS] Request started at ${new Date(startTime).toISOString()} `);

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting
  const rateLimit = await checkRateLimit(userId); // Uses default 25 requests per minute
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: rateLimit.error || "Too Many Requests" },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString()
        }
      }
    );
  }

  try {
    const { text, sourceType, analysisMode, sourceA, sourceB, force, documents, documentId, title } = await request.json();
    console.log(`[ANALYSIS] Received request. Text length: ${text?.length || 0}, Mode: ${analysisMode}, Force: ${force}, DocID: ${documentId}`);

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    if ((!text || text.length < 50) && analysisMode !== 'comparative_synthesis' && analysisMode !== 'resistance_synthesis') {
      console.warn(`[ANALYSIS] Rejected request with insufficient text length: ${text?.length || 0}`);
      return NextResponse.json(
        { error: 'Insufficient text content. Please ensure the document has text (not just images) and try again.' },
        { status: 400 }
      );
    }

    // --- CACHING LOGIC START ---
    console.log('[ANALYSIS] Starting cache check...');
    let textForCache = text || '';

    // Append documentId to ensure uniqueness even if text is identical
    if (documentId) {
      textForCache += `|doc:${documentId}`;
    }

    if (analysisMode === 'comparison' && sourceA && sourceB) {
      textForCache = `${sourceA.title}:${sourceA.text}|${sourceB.title}:${sourceB.text}`;
    } else if (analysisMode === 'comparative_synthesis' && documents) {
      textForCache = documents.map((d: any) => d.id).sort().join(',');
    } else if (analysisMode === 'resistance_synthesis' && documents) {
      textForCache = documents.map((d: any) => d.title).sort().join(',');
    }

    const cacheKey = generateCacheKey(analysisMode || 'default', textForCache, sourceType || 'unknown');
    const userCacheKey = `user:${userId}:${cacheKey}`;
    console.log(`[ANALYSIS] Cache Key generated: ${userCacheKey}`);

    try {
      // Skip cache if force is true
      if (!force) {
        console.log('[ANALYSIS] Checking Redis cache...');
        const cachedResult = await redis.get(userCacheKey);
        if (cachedResult) {
          console.log(`[CACHE HIT] Returning cached analysis for key: ${userCacheKey}`);
          console.log(`[ANALYSIS] Completed (Cache Hit) in ${Date.now() - startTime}ms`);
          return NextResponse.json({
            success: true,
            analysis: JSON.parse(cachedResult),
            cached: true
          });
        }
        console.log('[ANALYSIS] Cache Miss.');
      } else {
        console.log(`[CACHE BYPASS] Force refresh requested for key: ${userCacheKey}`);
      }
    } catch (cacheError) {
      console.warn('Redis cache read failed:', cacheError);
      // Continue to API call if cache fails
    }
    // --- CACHING LOGIC END ---

    console.log('[ANALYSIS] Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    let systemPrompt = DSF_SYSTEM_PROMPT;
    let userContent = '';

    if (analysisMode === 'comparison') {
      systemPrompt = COMPARISON_SYSTEM_PROMPT;
      userContent = `SOURCE A(${sourceA.title}):
${sourceA.text}

SOURCE B(${sourceB.title}):
${sourceB.text}

Please compare these two sources according to the system prompt instructions.`;
    } else if (analysisMode === 'ecosystem') {
      systemPrompt = ECOSYSTEM_SYSTEM_PROMPT;
      userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please map the ecosystem impacts of this text according to the system prompt instructions.`;
    } else if (analysisMode === 'resistance') {
      systemPrompt = RESISTANCE_SYSTEM_PROMPT;
      userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze this text according to the system prompt instructions.`;
    } else if (analysisMode === 'generate_resistance') {
      systemPrompt = RESISTANCE_GENERATION_PROMPT;
      userContent = `POLICY DOCUMENT TEXT:
${text}

Please generate 3 synthetic resistance traces based on this policy.`;
    } else if (analysisMode === 'ontology') {
      systemPrompt = ONTOLOGY_SYSTEM_PROMPT;
      userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please extract the ontology / concept map from this text.`;
    } else if (analysisMode === 'cultural_framing') {
      systemPrompt = CULTURAL_FRAMING_PROMPT;
      userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the cultural framing of this text according to the system prompt instructions.`;
    } else if (analysisMode === 'institutional_logics') {
      systemPrompt = INSTITUTIONAL_LOGICS_PROMPT;
      userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the institutional logics in this text according to the system prompt instructions.`;
    } else if (analysisMode === 'legitimacy') {
      systemPrompt = LEGITIMACY_PROMPT;
      userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the legitimacy and justification orders in this text.`;
    } else if (analysisMode === 'comparative_synthesis') {
      systemPrompt = COMPARATIVE_SYNTHESIS_PROMPT;
      userContent = `DOCUMENTS TO SYNTHESIZE:
${JSON.stringify(documents, null, 2)}

Please synthesize the analysis results for these documents.`;
    } else if (analysisMode === 'cultural_holes') {
      systemPrompt = CULTURAL_HOLES_PROMPT;
      userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please identify cultural holes in this text.`;
    } else if (analysisMode === 'assemblage_extraction') {
      systemPrompt = ASSEMBLAGE_EXTRACTION_PROMPT;
      userContent = `TEXT CONTENT:
${text}

Please extract the assemblage from this text.`;
    } else if (analysisMode === 'resistance_synthesis') {
      systemPrompt = RESISTANCE_SYNTHESIS_PROMPT;
      userContent = `ANALYZED TRACES TO SYNTHESIZE:
${JSON.stringify(documents, null, 2)}

Please synthesize these resistance findings according to the system prompt instructions.`;
    } else {
      // Default to DSF / Standard Analysis
      systemPrompt = DSF_SYSTEM_PROMPT;
      userContent = `DOCUMENT TITLE: ${title || 'Untitled Document'}
SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze this text using the Decolonial Situatedness Framework (DSF) as described in the system prompt.`;
    }

    console.log(`[ANALYSIS] Calling OpenAI for mode: ${analysisMode}`);
    const aiStartTime = Date.now();

    // Call OpenAI API
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      });
      console.log(`[ANALYSIS] OpenAI response received in ${Date.now() - aiStartTime}ms`);
    } catch (openaiError) {
      console.error('[ANALYSIS CRITICAL ERROR] OpenAI API call failed:', openaiError);
      throw openaiError;
    }

    const responseText = completion.choices[0]?.message?.content || '';
    console.log(`[ANALYSIS] Raw OpenAI response (first 500 chars): ${responseText.substring(0, 500)}`);

    // Try to parse JSON response
    let analysis;
    try {
      // Robust JSON extraction
      let cleanedResponse = responseText.replace(/```json\s * /gi, '').replace(/```/g, '').trim();

      // Find the first '{' or '[' to handle potential preamble text
      const firstBrace = cleanedResponse.indexOf('{');
      const firstBracket = cleanedResponse.indexOf('[');

      let start = -1;
      let end = -1;

      // Determine if it's an object or array and find start/end
      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = cleanedResponse.lastIndexOf('}');
      } else if (firstBracket !== -1) {
        start = firstBracket;
        end = cleanedResponse.lastIndexOf(']');
      }

      if (start !== -1 && end !== -1) {
        cleanedResponse = cleanedResponse.substring(start, end + 1);
      }

      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("[ANALYSIS ERROR] JSON Parse failed:", parseError);
      console.log("[ANALYSIS ERROR] Failed text:", responseText);
      // If not JSON, structure it manually
      if (analysisMode === 'resistance') {
        analysis = {
          strategy_detected: "Unstructured Analysis",
          evidence_quote: "See raw response",
          interpretation: responseText.substring(0, 300),
          confidence: "Low",
          raw_response: responseText
        };
      } else if (analysisMode === 'comparison') {
        analysis = {
          raw_response: responseText,
          error: "Failed to parse structured comparison"
        };
      } else if (analysisMode === 'ecosystem') {
        analysis = [{
          actor: "Unstructured Analysis",
          mechanism: "See raw response",
          impact: responseText.substring(0, 300),
          type: "Constraint"
        }];
      } else if (analysisMode === 'generate_resistance') {
        analysis = [{
          title: "Generation Failed",
          description: "Could not parse generated traces.",
          content: responseText
        }];
      } else if (analysisMode === 'assemblage_extraction') {
        analysis = {
          assemblage: { name: "Extraction Failed", description: "Could not parse response", properties: { stability: "Low", generativity: "Low" } },
          actors: [],
          relations: [],
          raw_response: responseText
        };
      } else if (analysisMode === 'cultural_holes') {
        analysis = {
          holes: [],
          recommendations: [],
          overall_connectivity_score: 0,
          raw_response: responseText
        };
      } else if (analysisMode === 'legitimacy') {
        analysis = {
          orders: { market: 0, industrial: 0, civic: 0, domestic: 0, inspired: 0, fame: 0 },
          dominant_order: "Unstructured",
          justification_logic: responseText.substring(0, 300),
          moral_vocabulary: [],
          conflict_spot: "Unknown",
          raw_response: responseText
        };
      } else if (analysisMode === 'resistance_synthesis') {
        analysis = {
          executive_summary: responseText.substring(0, 300),
          dominant_strategies: [],
          emerging_themes: [],
          implications_for_policy: "Failed to parse structured synthesis.",
          raw_response: responseText
        };
      } else {
        analysis = {
          governance_power_accountability: responseText.substring(0, 300),
          plurality_inclusion_embodiment: 'See full analysis',
          agency_codesign_self_determination: 'See full analysis',
          reflexivity_situated_praxis: 'See full analysis',
          key_insight: 'Analysis completed',
          raw_response: responseText
        };
      }
    }

    // --- SAVE TO CACHE ---
    try {
      // Cache for 30 days (2592000 seconds)
      await redis.setex(userCacheKey, 2592000, JSON.stringify(analysis));
      console.log(`[CACHE SAVE] Saved analysis to Redis: ${userCacheKey} `);
    } catch (cacheError) {
      console.warn('Redis cache save failed:', cacheError);
    }
    // ---------------------

    console.log(`[ANALYSIS] Request completed successfully in ${Date.now() - startTime} ms`);

    return NextResponse.json({
      success: true,
      analysis,
      usage: completion.usage
    });

  } catch (error: unknown) {
    console.error(`[ANALYSIS ERROR] Failed after ${Date.now() - startTime} ms: `, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
