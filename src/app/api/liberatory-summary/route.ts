import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { calculateLiberatoryCapacity } from '@/lib/liberatory-calculator';
import { AnalysisResult } from '@/types';
import { fillLiberatoryPrompt } from '@/lib/prompts/liberatory';
import { PromptRegistry } from '@/lib/prompts/registry';



export async function POST(req: NextRequest) {
    try {
        const { analysis, context } = await req.json() as { analysis: AnalysisResult, context?: string };
        const userId = req.headers.get('x-user-id') || 'default-user';

        if (!analysis) {
            return NextResponse.json({ error: 'Analysis data required' }, { status: 400 });
        }

        // 1. Calculate Capacity Deterministically
        const capacity = calculateLiberatoryCapacity(analysis);

        // 2. Fetch Prompt Template (allows user overrides from Settings)
        const template = await PromptRegistry.getEffectivePrompt(userId, 'liberatory_capacity');

        // 3. Fill Template with Dynamic Data
        const prompt = fillLiberatoryPrompt(template, context || 'Unknown Document', capacity);

        // 4. Generate Narrative Explanation via AI
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o", // Fast model sufficient for summary
            messages: [{ role: 'system', content: prompt }],
            temperature: 0.3,
            max_tokens: 150
        });

        const narrative = completion.choices[0]?.message?.content || "Analysis complete.";

        return NextResponse.json({
            success: true,
            capacity,
            narrative
        });

    } catch (error) {
        console.error('[LIBERATORY SUMMARY ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
