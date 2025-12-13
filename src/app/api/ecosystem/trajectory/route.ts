import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { TRAJECTORY_PROMPT } from '@/lib/prompts/trajectory';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { actors, scenario, prompt_override } = await req.json();

        if (!actors || !scenario) {
            return NextResponse.json(
                { success: false, error: 'Missing actors or scenario' },
                { status: 400 }
            );
        }

        const systemPrompt = TRAJECTORY_PROMPT;
        const userPrompt = `
        SCENARIO: ${scenario.name}
        DESCRIPTION: ${scenario.description}
        
        ACTORS:
        ${JSON.stringify(actors.map((a: any) => ({ id: a.id, name: a.name, type: a.type })), null, 2)}
        
        Analyze the trajectory of this assemblage under these conditions.
        Return ONLY valid JSON.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        const analysis = JSON.parse(content);

        return NextResponse.json({ success: true, analysis });

    } catch (error: any) {
        console.error('Trajectory analysis error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to analyze trajectory' },
            { status: 500 }
        );
    }
}
