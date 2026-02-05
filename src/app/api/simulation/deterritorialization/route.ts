import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { redis } from '@/lib/redis';
import { generateActorHash, getDeterritorializationCacheKey, DETERRITORIALIZATION_CACHE_TTL } from '@/lib/cache-utils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { actors, relationships, context } = await req.json();

    // Basic validation
    if (!actors || !Array.isArray(actors) || actors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid actors list' },
        { status: 400 }
      );
    }

    // Generate cache key from actor data
    const actorHash = generateActorHash(actors, context);
    const cacheKey = getDeterritorializationCacheKey(userId!, actorHash);

    // Check cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        return NextResponse.json({
          success: true,
          data: cachedData,
          cached: true,
          cacheKey: actorHash
        });
      }
    } catch (cacheError) {
      console.warn('Cache read error:', cacheError);
      // Continue to generation if cache fails
    }

    // System Prompt: Deleuzian Analyst
    const systemPrompt = `
You are a "Deleuzian Simulation Engine." Your goal is to analyze a network of actors (an Assemblage) and identify its "Lines of Flight" (escape routes) and "Capture Mechanisms" (control systems).

The user handles a "Deterritorialization" visualization (a Sankey diagram) with fixed Start and End points:
1. START: "Global Capital Flows" (The abstract machine)
2. END: "Extractive Development" (The negative outcome)

Your job is to generate the MIDDLE layer of nodes and the EXPLANATION.

### Middle Layer Logic:
You must identify 4 specific mechanisms relevant to the provided actors:
1. CAPTURE MECHANISM (Node index 1): How does the system control these specific actors? (e.g., "Algorithmic Management", "Debt Bondage", "zoning Laws")
2. CONTESTATION (Node index 2): How are the actors resisting? (e.g., "Wildcat Strikes", "Squatting", "Data Poisoning")
3. REABSORPTION (Node index 3): A "Fake" solution the system offers to neutralize resistance. (e.g., "HR Grievance Portal", "Corporate DEI", "Public Consultation")
4. LINE OF FLIGHT (Node index 4): A GENUINE structural escape or transformation. (e.g., "Platform Cooperative", "Community Land Trust", "Mesh Network")

### Rules:
1. Be specific to the provided actor list.
2. **CRITICAL:** Node names MUST be Short & Punchy (Max 5 words). (e.g., "Algorithmic Control" NOT "The system uses algorithmic control to manage workers...").
3. "Reabsorption" must lead back to the negative outcome.
4. "Line of Flight" is the only path that escapes.

### Additional Outputs:
5. **Tactical Arsenal:** Identify 3 specific "Tools of Capture" (methods used to stifle dissent) and 3 "Weapons of Escape" (strategies for autonomy) relevant to these actors.
6. **Resistance Matrix:** distinct from the flow nodes, position 4-6 key actors/concepts on a 2x2 grid:
   - X-Axis: Likelihood of Co-optation (0.0 to 1.0)
   - Y-Axis: Potential for Structural Change (0.0 to 1.0)

### Output Format (JSON Only):
Return a JSON object with this exact schema:
{
  "nodes": [
    { "name": "Global Capital Flows" },  // Fixed
    { "name": "..." },                   // Dynamic: Capture (MAX 4 WORDS)
    { "name": "..." },                   // Dynamic: Contestation (MAX 4 WORDS)
    { "name": "..." },                   // Dynamic: Reabsorption (MAX 4 WORDS)
    { "name": "..." },                   // Dynamic: Line of Flight (MAX 4 WORDS)
    { "name": "Extractive Development" } // Fixed
  ],
  "links": [
    { "source": 0, "target": 1, "value": 50 },
    { "source": 1, "target": 5, "value": 35 },
    { "source": 1, "target": 2, "value": 15 },
    { "source": 2, "target": 3, "value": 12 },
    { "source": 3, "target": 5, "value": 12 },
    { "source": 2, "target": 4, "value": 3 }
  ],
  "explanation": "A short, slight theoretical paragraph explaining why [Line of Flight] is the true escape while [Reabsorption] is just a trap.",
  "tactics": {
    "capture": ["Tactic 1", "Tactic 2", "Tactic 3"],
    "escape": ["Strategy 1", "Strategy 2", "Strategy 3"]
  },
  "matrix": [
    { "name": "Actor/Concept Name", "x": 0.2, "y": 0.8, "type": "resistance" },
    { "name": "Actor/Concept Name", "x": 0.8, "y": 0.3, "type": "capture" }
  ]
}
`;

    const userPrompt = `
CONTEXT: ${context || 'General assemblages'}

ACTORS:
${JSON.stringify(actors.map((a: any) => ({ name: a.name, type: a.type })), null, 2)}

RELATIONSHIPS:
${JSON.stringify(relationships || [], null, 2)}

Generate the Deterritorialization Simulation JSON.
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4, // Keep it relatively strictly structured
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content from AI');

    const simulationData = JSON.parse(content);

    // Add timestamp to cached data
    const dataToCache = {
      ...simulationData,
      timestamp: new Date().toISOString(),
    };

    // Store in cache with TTL
    try {
      await redis.setex(
        cacheKey,
        DETERRITORIALIZATION_CACHE_TTL,
        JSON.stringify(dataToCache)
      );
    } catch (cacheError) {
      console.warn('Cache write error:', cacheError);
      // Continue even if cache fails
    }

    return NextResponse.json({
      success: true,
      data: dataToCache,
      cached: false,
      cacheKey: actorHash
    });

  } catch (error: unknown) {
    console.error('Deterritorialization simulation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const actorsJson = searchParams.get('actors');
    const context = searchParams.get('context') || undefined;

    if (!actorsJson) {
      return NextResponse.json(
        { success: false, error: 'Missing actors parameter' },
        { status: 400 }
      );
    }

    const actors = JSON.parse(actorsJson);
    const actorHash = generateActorHash(actors, context);
    const cacheKey = getDeterritorializationCacheKey(userId, actorHash);

    const cached = await redis.get(cacheKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        cacheKey: actorHash
      });
    }

    return NextResponse.json({
      success: true,
      data: null,
      cached: false
    });

  } catch (error: unknown) {
    console.error('Cache retrieval error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
