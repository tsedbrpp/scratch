import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { checkRateLimit } from '@/lib/ratelimit';

import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    let { userId } = await auth();

    // Check for demo user if not authenticated
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

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

    // Credit Check
    const { checkCredits } = await import('@/lib/credits');
    const creditResult = await checkCredits(userId, 10); // Cost: 10 credits per simulation

    if (!creditResult.success) {
        return NextResponse.json(
            { error: `Insufficient credits. You have ${creditResult.remaining} credits remaining.` },
            { status: 402 } // Payment Required
        );
    }

    try {
        const { query } = await request.json();
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ success: false, error: "Missing GOOGLE_API_KEY in .env.local" }, { status: 500 });
        }

        // Generate cache key
        const cacheKey = `user:${userId}:ecosystem:simulate:${Buffer.from(query).toString('base64')}`;

        // Check cache
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log('Returning cached ecosystem simulation');
                return NextResponse.json(JSON.parse(cachedData));
            }
        } catch (error) {
            console.error('Redis cache check failed:', error);
        }

        // Use Gemini to generate synthetic ecosystem actors based on the query
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
        You are an expert on AI governance ecosystems and social network analysis.
        
        Your task is to identify relevant "Ecosystem Actors" based on the user's search query: "${query}"

        1. **Semantic Analysis**: First, analyze the *intent* and *context* of the query. 
           - If the query is about a topic (e.g., "Generative AI regulation"), identify key stakeholders (regulators, affected startups, critics).
           - If the query is about a region (e.g., "Brazil AI"), identify local and international players active there.
           - If the query is about a conflict (e.g., "Copyright resistance"), identify opposing sides.

        2. **Actor Generation**: Generate a realistic list of 3-5 distinct actors based on this analysis.
           - The actors should be plausible real-world entities (or realistic archetypes if specific names aren't found).
           - Ensure diversity: include at least one Policymaker, one Startup/Company, one Civil Society/Academic actor, and at least one **Algorithm** or **Dataset** actor.
           - **CRITICAL FOR ALGORITHMS/DATASETS**: Do NOT use generic names like "AI Model" or "Training Data". You MUST use specific, real-world examples relevant to the query (e.g., if query is "LLM", use "GPT-4" or "The Pile"; if query is "Surveillance", use "Clearview AI Algorithm" or "Faces in the Wild").

        Return a JSON object with a key "actors" containing an array of objects. Each object must have:
        - "id": A unique string ID (kebab-case based on name).
        - "name": Name of the actor.
        - "type": One of "Startup", "Policymaker", "Civil Society", "Academic", "Infrastructure", "Algorithm", "Dataset".
        - "description": A rich description explaining *why* they are relevant to the query "${query}".
        - "influence": "High", "Medium", or "Low".
        - "url": The official website URL or a relevant profile page.
        - "metrics": An object containing:
            - "influence": 1-10 integer (Power in the network).
            - "alignment": 1-10 integer (Congruence with dominant norms).
            - "resistance": 1-10 integer (Potential for disruption/friction). THIS IS CRITICAL. Ensure some actors have High Resistance (>6) if they are critics, activists, or disruptive technologies.

        Output JSON only.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up code blocks if present
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        const responseData = { success: true, actors: parsedData.actors };

        // Cache result (expire in 24 hours)
        try {
            await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60 * 60 * 24);
        } catch (error) {
            console.error('Failed to cache ecosystem simulation:', error);
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Simulation error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to simulate ecosystem"
        }, { status: 500 });
    }
}
