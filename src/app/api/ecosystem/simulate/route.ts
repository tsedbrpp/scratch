import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage-service';
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
        const cacheKey = `ecosystem:simulate:${Buffer.from(query).toString('base64')}`;

        // Check cache
        const cachedData = await StorageService.getCache(userId, cacheKey);
        if (cachedData) {
            console.log('Returning cached ecosystem simulation');
            return NextResponse.json(cachedData);
        }

        // Use Gemini to generate synthetic ecosystem actors based on the query
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash-latest";
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
        You are an expert on AI governance ecosystems and social network analysis.
        
        Your task is to identify relevant "Ecosystem Actors" based on the user's search query: "${query}"

        ### 1. Contextual Relevance Analysis
        - **Intent**: Is this a broad exploration (e.g., "AI Regulation") or a specific gap-filling task (e.g., "Missing labor voices in UAP data labeling")?
        - **Specific NOT Generic**: If the user asks for a specific niche (e.g., "UAP Policy"), DO NOT just return generic AI companies (like OpenAI, Scale AI) unless they are explicitly directly involved. 
        - **Absence Filling**: If the query mentions "missing voices" or "silenced actors", prioritize generating **specific, localized, or functional actors** that fill that gap, even if they are less famous or hypothetical archetypes (e.g., "Anonymous Data Labeler Union" instead of just "Scale AI").

        ### 2. Actor Generation Rules
        - Generate 3-5 distinct actors.
        - **Relevance > Fame**: It is better to invent a plausible specific actor (e.g., "UAP Whistleblower Network") that fits the query perfectly than to return a famous real actor that is only tangentially related.
        - **Diversity (Soft Constraint)**: *Unless the query asks for a specific type*, try to include a mix of Policymakers, Startups, Civil Society, and Non-Humans (Algorithms/Datasets).
        - **Non-Human Actors**: If relevant, include specific Algorithms (e.g., "Computer Vision Sentinel") or Datasets (e.g., "Declassified Sensor Logs").
        
        ### 3. Detailed Data Requirements
        Return a JSON object with a key "actors" containing an array of objects. Each object must have:
        - "name": Specific and evocative name.
        - "type": One of "Startup", "Policymaker", "Civil Society", "Academic", "Infrastructure", "Algorithm", "Dataset".
        - "description": Explain exactly *why* this actor is critical to the "${query}" context.
        - "influence": "High", "Medium", or "Low".
        - "url": Official Homepage URL (Root Domain only, e.g., "https://www.un.org"). Do NOT generate deep paths (e.g., "un.org/agency/...") as they often 404. If no clear homepage exists, return a Google Search URL.
        - "metrics": 
            - "influence": 1-10 (Power)
            - "alignment": 1-10 (Mainstream fit)
            - "resistance": 1-10 (Critical agency). **Make this HIGH (>7) for valid counter-power actors.**

        Output JSON only.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up code blocks if present
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        const responseData = { success: true, actors: parsedData.actors };

        // Cache result (expire in 24 hours)
        await StorageService.setCache(userId, cacheKey, responseData, 60 * 60 * 24);

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Simulation error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to simulate ecosystem"
        }, { status: 500 });
    }
}
