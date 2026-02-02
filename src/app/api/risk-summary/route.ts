import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { calculateMicroFascismRisk } from '@/lib/risk-calculator';
import { AnalysisResult } from '@/types';
import { fillRiskSummaryPrompt } from '@/lib/prompts/micro-fascism';
import { PromptRegistry } from '@/lib/prompts/registry';
import { capturePromptMetadata, calculateConfidenceScore } from '@/lib/transparency-utils';
import { StorageService } from '@/lib/storage-service';
import crypto from 'crypto';



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

        // [CACHE] Check for existing narrative
        const analysisHash = crypto.createHash('sha256').update(JSON.stringify(analysis)).digest('hex');
        const cacheKey = `narrative:risk:${analysisHash}`;

        const cached = await StorageService.getCache<{ narrative: string, risk: any, metadata: any, confidence: any }>(userId, cacheKey);
        if (cached) {
            console.log('[RISK SUMMARY] Cache Hit');
            return NextResponse.json({
                success: true,
                risk: cached.risk,
                narrative: cached.narrative,
                metadata: cached.metadata,
                confidence: cached.confidence,
                from_cache: true
            });
        }

        // 4. Generate Narrative Explanation via AI
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const modelVersion = process.env.OPENAI_MODEL || "gpt-4o";

        const completion = await openai.chat.completions.create({
            model: modelVersion,
            messages: [{ role: 'system', content: prompt }],
            max_completion_tokens: 150
        });

        const narrative = completion.choices[0]?.message?.content || "Analysis complete.";

        // [TRANSPARENCY] Capture prompt metadata
        const metadata = capturePromptMetadata(
            prompt,
            modelVersion,
            0.3,
            150
        );

        // [TRANSPARENCY] Calculate confidence score (multi-step)
        const apiKey = process.env.OPENAI_API_KEY || '';
        const confidence = await calculateConfidenceScore(
            `Risk Analysis: ${narrative}\nRisk Score: ${risk.score}\nRisk Level: ${risk.level}`,
            apiKey
        );

        const responseData = {
            success: true,
            risk,
            narrative,
            // [TRANSPARENCY] Include transparency data
            metadata,
            confidence: {
                score: confidence.score,
                justification: confidence.justification,
                calculated_at: new Date().toISOString()
            }
        };

        // [CACHE] Save to Redis
        await StorageService.setCache(userId, cacheKey, responseData, 60 * 60 * 24 * 7); // Cache for 1 week

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('[RISK SUMMARY ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
