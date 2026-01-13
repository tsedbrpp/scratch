
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/ratelimit';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { performCulturalAnalysis } from '@/lib/cultural-analysis-service';

export const maxDuration = 300; // Allow up to 5 minutes for analysis
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log(`[CULTURAL ANALYSIS] Request started at ${new Date(startTime).toISOString()} `);

    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        const { sources, lensId, forceRefresh } = await request.json();

        if (!sources || !Array.isArray(sources) || sources.length < 2) {
            return NextResponse.json(
                { error: "At least 2 sources are required for cultural analysis." },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OpenAI API Key required" }, { status: 500 });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: process.env.OPENAI_BASE_URL,
        });

        const fs = require('fs');
        const log = (msg: string) => fs.appendFileSync('debug_cultural.log', msg + '\n');
        log(`[START] Analyzing ${sources.length} sources with lens: ${lensId}`);

        const analysis = await performCulturalAnalysis(userId, sources, lensId || 'default', openai);

        log(`[SUCCESS] Completed in ${Date.now() - startTime} ms`);

        console.log(`[CULTURAL ANALYSIS] Completed in ${Date.now() - startTime} ms`);

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (error: unknown) {
        console.error(`[CULTURAL ANALYSIS ERROR] Failed: `, error);
        return NextResponse.json(
            {
                error: 'Cultural Analysis failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
