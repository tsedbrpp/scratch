import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        let { userId } = await auth();

        // Handle Demo Mode
        if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
            const demoUserId = req.headers.get('x-demo-user-id');
            if (demoUserId) userId = demoUserId;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { systemPrompt, userContent } = await req.json();

        if (!systemPrompt) {
            return NextResponse.json({ error: 'System prompt is required' }, { status: 400 });
        }

        // Default test content if none provided, though UI should enforce it or provide placeholder
        const content = userContent || "Test input content.";

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Use a capable model for testing
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: content }
            ],
            temperature: 0.7,
        });

        return NextResponse.json({
            success: true,
            result: completion.choices[0].message.content
        });

    } catch (error: any) {
        console.error("Test Prompt Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to test prompt' },
            { status: 500 }
        );
    }
}
