import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// DSF Lens System Prompt
const DSF_SYSTEM_PROMPT = `You are an expert qualitative researcher acting as an 'Analytical Lens'. 
Your specific lens is the **Decolonial Situatedness Framework (DSF)**.

DO NOT merely summarize the text. You must interpret it through the following dimensions:

1. **Governance, Power & Accountability**: How does this system encode institutional power? Who defines the goals, holds authority, and bears the risk? Look for accountability mechanisms or lack thereof.

2. **Plurality, Inclusion & Embodiment**: Does this system value diverse knowledge systems and embodied experiences? Or does it reinforce a 'default' user assumption? Look for exclusions of Indigenous, disability, or non-Western perspectives.

3. **Agency, Co-Design & Self-Determination**: To what extent does this system allow for community agency, co-design, or the right to refuse? Does it support self-determination or impose external control?

4. **Reflexivity & Situated Praxis**: Does the text show evidence of examining its own positionality, history, and value assumptions? Are the designers aware of the structural inequities shaping their choices?

5. **Legitimacy Claims**: What forms of legitimacy does this system invoke? How does it justify its authority and decisions? Look for democratic, technocratic, market-based, or rights-based legitimacy claims and any tensions between them.

Your goal is to reveal structural power dynamics that a standard technical or ethical analysis would miss.

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
  "key_insight": "One-sentence summary of the most critical finding",
  "governance_scores": {
    "centralization": 0-100, // 0=Decentralized, 100=Centralized
    "rights_focus": 0-100, // 0=Market-focus, 100=Rights-focus
    "flexibility": 0-100, // 0=Prescriptive, 100=Flexible
    "market_power": 0-100, // 0=Laissez-faire, 100=Interventionist
    "procedurality": 0-100 // 0=Substantive, 100=Procedural
  },
  "structural_pillars": {
    "risk": { "title": "Short Title", "description": "Brief summary of risk approach", "badge": "One-word characteristic" },
    "enforcement": { "title": "Short Title", "description": "Brief summary of enforcement", "badge": "One-word characteristic" },
    "rights": { "title": "Short Title", "description": "Brief summary of rights", "badge": "One-word characteristic" },
    "scope": { "title": "Short Title", "description": "Brief summary of scope", "badge": "One-word characteristic" }
  }
}`;

// Cultural Framing System Prompt
const CULTURAL_FRAMING_PROMPT = `You are an expert comparative sociologist analyzing how policy documents reflect culturally-specific assumptions about technology governance.

Analyze this text for cultural framing across these dimensions:

1. **State-Market-Society Relationship**: What is the assumed role of government, market, and civil society?
2. **Technology's Role**: How is technology positioned in relation to social life? (Tool, infrastructure, threat, opportunity?)
3. **Rights Conception**: Individual vs. collective rights emphasis? Procedural vs. substantive?
4. **Historical/Colonial Context**: What historical experiences or power dynamics shape this approach?
5. **Epistemic Authority**: Whose knowledge counts as legitimate? (Experts, affected communities, market actors?)

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
const INSTITUTIONAL_LOGICS_PROMPT = `You are an expert organizational theorist analyzing institutional logics in policy documents.

Identify which institutional logics are present and how they conflict. Analyze presence of:

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
const ECOSYSTEM_SYSTEM_PROMPT = `You are an expert qualitative researcher analyzing the impact of a policy document on an organizational ecosystem using the **Decolonial Situatedness Framework (DSF)**.

Identify specific "Policy Mechanisms" in the text and map their impact on different ecosystem actors (e.g., Gig Workers, Startups, Indigenous Communities, Public Sector).

For each mechanism, determine:
1. **Actor**: Who is affected?
2. **Mechanism**: What specific policy clause or requirement is at play?
3. **Impact**: How does it constrain or afford possibilities?
4. **Type**: Is it a "Constraint" (limiting) or "Affordance" (enabling)?
5. **Interconnection Type**: Is this primarily a "Material" interconnection (infrastructure, hardware, physical resources), "Discursive" interconnection (norms, language, knowledge systems), or "Hybrid" (both)?

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
Your task is to extract a "Concept Map" (Ontology) from the provided text.

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
const CULTURAL_HOLES_PROMPT = `You are an expert social network analyst and sociologist specializing in "Structural Holes" and "Cultural Holes".
Your task is to identify "Cultural Holes" - systematic disconnects in meaning, language, or values - between different groups of actors in an ecosystem.

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
      "description": "Explanation of the disconnect (e.g., 'Startups view AI as a tool, Policymakers view it as a risk')",
      "significance": "High/Medium/Low"
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

export async function POST(request: NextRequest) {
  try {
    const { text, sourceType, analysisMode, sourceA, sourceB } = await request.json();

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    let systemPrompt = DSF_SYSTEM_PROMPT;
    let userContent = '';

    if (analysisMode === 'comparison') {
      systemPrompt = COMPARISON_SYSTEM_PROMPT;
      userContent = `SOURCE A (${sourceA.title}):
${sourceA.text}

SOURCE B (${sourceB.title}):
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
    } else if (analysisMode === 'cultural_holes') {
      systemPrompt = CULTURAL_HOLES_PROMPT;
      userContent = `ECOSYSTEM ACTOR DESCRIPTIONS:
${text}

Please identify the cultural holes between these actors.`;
    } else {
      // Default DSF Analysis
      userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze this text according to the system prompt instructions.`;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Try to parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
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
      } else if (analysisMode === 'cultural_holes') {
        analysis = {
          holes: [],
          recommendations: [],
          overall_connectivity_score: 0,
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

    return NextResponse.json({
      success: true,
      analysis,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
