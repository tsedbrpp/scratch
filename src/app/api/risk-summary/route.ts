import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { calculateMicroFascismRisk } from '@/lib/risk-calculator';
import { AnalysisResult } from '@/types';
import { fillRiskSummaryPrompt } from '@/lib/prompts/micro-fascism';
import { PromptRegistry } from '@/lib/prompts/registry';



export async function POST(req: NextRequest) {
    try {
        const { analysis, context } = await req.json() as { analysis: AnalysisResult, context?: string };
        const userId = req.headers.get('x-user-id') || 'default-user';

        if (!analysis) {
            return NextResponse.json({ error: 'Analysis data required' }, { status: 400 });
        }

        // 1. Calculate Risk Deterministically
        const risk = calculateMicroFascismRisk(analysis);

        // 2. Fetch Prompt Template (allows user overrides from Settings)
        const template = await PromptRegistry.getEffectivePrompt(userId, 'micro_fascism_risk');

        // 3. Fill Template with Dynamic Data
        const prompt = fillRiskSummaryPrompt(template, context || 'Unknown Document', risk);

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
            risk,
            narrative
        });

    } catch (error) {
        console.error('[RISK SUMMARY ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
