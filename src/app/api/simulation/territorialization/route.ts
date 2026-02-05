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

// Cache key helper for territorialization
function getTerritorizationCacheKey(userId: string, actorHash: string): string {
    return `user:${userId}:cache:territorialization:v1:${actorHash}`;
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const { actors, relationships, context, force } = await req.json();

        // Basic validation
        if (!actors || !Array.isArray(actors) || actors.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Missing or invalid actors list' },
                { status: 400 }
            );
        }

        // Generate cache key from actor data
        const actorHash = generateActorHash(actors, context);
        const cacheKey = getTerritorizationCacheKey(userId!, actorHash);

        // Check cache unless forced to regenerate
        if (!force) {
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
            }
        }

        // System Prompt: Territorialization Analyst
        const systemPrompt = `
You are a Deleuzian assemblage analyst specializing in "territorialization"—the process by which fluid, dynamic networks become rigid, stratified structures locked into place.

Your task is to analyze an ecosystem of actors and classify each based on their structural position and dependencies.

### Core Concepts:
- **TERRITORIALIZATION**: The process of stabilization, stratification, and capture. Actors become "locked in" through dependencies, compliance obligations, funding streams, and institutional mandates.
- **STABILIZED (CBD)**: Actors tightly bound to the assemblage's center through dependencies.
- **PERIPHERAL (Suburb)**: Autonomous actors operating independently of the central structure but not necessarily in opposition to it.
- **RESISTANT**: Actors actively opposing, sabotaging, or avoiding capture. They represent "Lines of Flight" or counter-power.

### Classification Criteria:
Analyze each actor's:
1. **Dependencies**: Funding sources, regulatory obligations, institutional partnerships
2. **Power Position**: Central authority vs. grassroots/advocacy
3. **Structural Role**: Formal institutional role vs. informal/voluntary
4. **Resistance**: Active resistance to capture vs. compliance

### Gradations (use these precise labels):
- "highly_stabilized": Deeply locked in (e.g., regulatory bodies, funded institutions)
- "stabilized": Moderately bound (e.g., compliant organizations)
- "marginal": On the edge, some autonomy (e.g., hybrid actors)
- "peripheral": Outside formal structures (e.g., grassroots groups)
- "resistant": Actively resisting capture (e.g., protest movements)

### Output Requirements:
Return a JSON object with:
1. **actors**: Array of {id, classification, reason, forceStrength}
   - classification: One of the 5 gradations above
   - reason: 1-2 sentence explanation (descriptive, not judgmental)
   - forceStrength: 0.0-1.0 (how strongly pulled to center)
2. **mechanisms**: Array of 3-5 key stabilization mechanisms (e.g., "Funding Dependencies", "Regulatory Compliance")
3. **gravitationalForces**: 2-3 sentence explanation of what creates assemblage rigidity
4. **explanation**: 2-3 sentence overview of territorialization dynamics
5. **globalGravity**: 0.0-1.0 (overall assemblage rigidity)

### Few-Shot Examples:

**Example 1: EU AI Governance**
Actors: European Commission, Member States, AI Board, Civil Society Orgs, Tech Companies

Output:
{
  "actors": [
    {"id": "ec", "classification": "highly_stabilized", "reason": "Central regulatory authority with funding control and enforcement power.", "forceStrength": 0.9},
    {"id": "states", "classification": "stabilized", "reason": "Bound by EU compliance obligations and implementation mandates.", "forceStrength": 0.7},
    {"id": "board", "classification": "stabilized", "reason": "Formal institutional role within regulatory framework.", "forceStrength": 0.7},
    {"id": "cso", "classification": "peripheral", "reason": "Advocacy organizations operating outside formal compliance structures.", "forceStrength": 0.2},
    {"id": "tech", "classification": "marginal", "reason": "Subject to regulation but maintain significant autonomy and lobbying power.", "forceStrength": 0.5}
  ],
  "mechanisms": ["Regulatory Compliance Mandates", "EU Funding Streams", "Institutional Partnerships", "Enforcement Mechanisms"],
  "gravitationalForces": "The EU AI Act creates gravitational pull through binding compliance requirements, funding dependencies, and institutional mandates that lock actors into formal structures.",
  "explanation": "This assemblage exhibits high territorialization through regulatory capture. State and institutional actors are tightly bound, while civil society maintains peripheral autonomy.",
  "globalGravity": 0.7
}

**Example 2: Community Land Trust**
Actors: Community Trust, Local Government, Residents, Developers, Banks

Output:
{
  "actors": [
    {"id": "trust", "classification": "resistant", "reason": "Explicitly designed to resist market capture and maintain community control.", "forceStrength": 0.1},
    {"id": "gov", "classification": "marginal", "reason": "Provides support but doesn't control; hybrid public-community partnership.", "forceStrength": 0.4},
    {"id": "residents", "classification": "peripheral", "reason": "Grassroots participants with direct democratic control.", "forceStrength": 0.2},
    {"id": "dev", "classification": "peripheral", "reason": "External actors constrained by trust rules, limited capture potential.", "forceStrength": 0.3},
    {"id": "banks", "classification": "stabilized", "reason": "Operate within conventional financial frameworks and regulatory compliance.", "forceStrength": 0.7}
  ],
  "mechanisms": ["Community Ownership", "Democratic Governance", "Market Constraints", "Regulatory Frameworks"],
  "gravitationalForces": "Low overall rigidity due to community control structures that resist conventional capture mechanisms. Banks remain stabilized through financial regulation.",
  "explanation": "This assemblage exhibits low territorialization, with community actors maintaining autonomy through alternative ownership structures that resist market and state capture.",
  "globalGravity": 0.3
}

### Important Notes:
- Be specific to the provided actors and their actual roles
- Use relationships data to identify dependencies
- Avoid binary thinking—use gradations
- Be descriptive, not judgmental (focus on structural position, not moral evaluation)
- **Active Detection**: Proactively look for actors whose mandates, funding sources, or public statements indicate resistance to central capture.
- Ensure forceStrength aligns with classification (highly_stabilized ≈ 0.8-1.0, resistant ≈ 0.0-0.2)
`;

        // User Prompt
        const actorList = actors.map((a: any) => `- ${a.name} (${a.type})`).join('\n');
        const relationshipList = relationships && relationships.length > 0
            ? relationships.map((r: any) => `- ${r.source} → ${r.target} (${r.type || 'connection'})`).join('\n')
            : 'No explicit relationships provided.';

        const userPrompt = `
Analyze the following ecosystem and classify each actor's territorialization status:

**Context**: ${context || 'General ecosystem analysis'}

**Actors**:
${actorList}

**Relationships**:
${relationshipList}

Return a JSON object following the exact schema specified in the system prompt.
`;

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3, // Low for consistency
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
                DETERRITORIALIZATION_CACHE_TTL, // 24 hours
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
        console.error('Territorialization simulation error:', error);
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
        const cacheKey = getTerritorizationCacheKey(userId, actorHash);

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
