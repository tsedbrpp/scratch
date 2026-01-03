import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { PromptRegistry } from '@/lib/prompts/registry';
import { AVAILABLE_PERSPECTIVES, DEFAULT_PERSPECTIVE_A, DEFAULT_PERSPECTIVE_B } from '@/lib/perspectives';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    let { userId } = await auth();
    // Demo mode support
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        userId = process.env.NEXT_PUBLIC_DEMO_USER_ID || null;
    }

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { topic = "AI Regulation", perspectiveAId, perspectiveBId } = body;

        // Resolve perspectives
        const perspA = AVAILABLE_PERSPECTIVES.find(p => p.id === perspectiveAId) || DEFAULT_PERSPECTIVE_A;
        const perspB = AVAILABLE_PERSPECTIVES.find(p => p.id === perspectiveBId) || DEFAULT_PERSPECTIVE_B;

        // Get effective prompt (user override or default)
        let systemPrompt = await PromptRegistry.getEffectivePrompt(userId, 'perspective_simulation');

        // Interpolate perspectives
        systemPrompt = systemPrompt
            .replace('{{PERSPECTIVE_A_NAME}}', perspA.name)
            .replace('{{PERSPECTIVE_A_DESC}}', perspA.description)
            .replace('{{PERSPECTIVE_B_NAME}}', perspB.name)
            .replace('{{PERSPECTIVE_B_DESC}}', perspB.description);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Generate conflicting perspectives on: ${topic}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        const result = JSON.parse(content);

        return NextResponse.json({
            success: true,
            perspectives: result
        });

    } catch (error: unknown) {
        console.error("Simulation failed:", error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || 'Simulation failed' },
            { status: 500 }
        );
    }
}
