import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { checkRateLimit } from '@/lib/ratelimit';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate Limiting
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.success) {
        return NextResponse.json(
            { error: rateLimit.error || "Too Many Requests" },
            { status: 429 }
        );
    }

    try {
        const { prompt } = await request.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OPENAI_API_KEY is not set' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Construct a rich prompt for the visualization
        const enhancedPrompt = `Create an abstract, artistic visualization of the following sociological concept: "${prompt}". 
    Style: Digital art, abstract, symbolic, high contrast, detailed. 
    Do not include text in the image.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
        });

        const imageBase64 = response.data?.[0]?.b64_json;

        if (!imageBase64) {
            throw new Error("No image data received from OpenAI");
        }

        return NextResponse.json({
            success: true,
            image: `data:image/png;base64,${imageBase64}`
        });

    } catch (error: unknown) {
        console.error('Image generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Image generation failed', details: errorMessage },
            { status: 500 }
        );
    }
}
