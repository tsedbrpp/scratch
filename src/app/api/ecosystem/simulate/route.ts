import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage-service';
import { checkRateLimit } from '@/lib/ratelimit';
import { createRateLimitResponse, createUnauthorizedResponse, createErrorResponse } from '@/lib/api-helpers';
import { auth } from '@clerk/nextjs/server';
import { PromptRegistry } from '@/lib/prompts/registry';

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
        return createUnauthorizedResponse();
    }

    // Rate Limiting
    const rateLimit = await checkRateLimit(userId); // Uses default 25 requests per minute
    if (!rateLimit.success) {
        return createRateLimitResponse(rateLimit);
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
        const { query, mode, actors } = await request.json();
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return createErrorResponse(new Error("Missing GOOGLE_API_KEY"), "Server Configuration Error");
        }

        // Generate cache key
        const cacheKey = `ecosystem:simulate:${mode || 'gen'}:${Buffer.from(query).toString('base64')}`;

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

        let prompt = "";

        if (mode === "cascade") {
            // DSR Feature: Compliance Cascade / Phase Transition Simulation
            const actorContext = actors?.map((a: any) => `- ${a.name} (${a.type})`).join('\n') || "Generic ecosystem";

            const template = await PromptRegistry.getEffectivePrompt(userId, 'compliance_cascade');
            prompt = template
                .replace('{{QUERY}}', query)
                .replace('{{ACTOR_CONTEXT}}', actorContext);

        } else {
            // Default: Actor Generation
            const template = await PromptRegistry.getEffectivePrompt(userId, 'ecosystem_generation');
            prompt = template.replace('{{QUERY}}', query);
        }

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up code blocks if present
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        let responseData;
        if (mode === "cascade") {
            responseData = { success: true, timeline: parsedData.timeline };
        } else {
            responseData = { success: true, actors: parsedData.actors };
        }

        // Cache result (expire in 24 hours)
        await StorageService.setCache(userId, cacheKey, responseData, 60 * 60 * 24);

        return NextResponse.json(responseData);

    } catch (error) {
        return createErrorResponse(error, "Failed to simulate ecosystem");
    }
}
