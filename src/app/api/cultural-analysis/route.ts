
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StorageService } from '@/lib/storage-service';
import { checkRateLimit } from '@/lib/ratelimit';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { performCulturalAnalysis } from '@/lib/cultural-analysis-service';

export async function POST(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        console.log('Unauthorized request. Headers:', Object.fromEntries(request.headers));
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

    try {
        // Check API key
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not set');
            return NextResponse.json(
                { success: false, error: 'OpenAI API key is not configured' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { sources, lensId = 'default', forceRefresh = false } = body;

        console.log('Cultural analysis request received:', {
            sourceCount: sources?.length,
            hasSources: !!sources,
            lensId
        });

        if (!sources || !Array.isArray(sources) || sources.length < 2) {
            console.error('Invalid sources:', sources);
            return NextResponse.json(
                { success: false, error: 'At least 2 sources required for cultural analysis' },
                { status: 400 }
            );
        }

        // Generate a unique key for this analysis request based on source IDs and lens
        // [FIX] Include source content hash to invalidate cache when descriptions change
        const contentString = JSON.stringify(sources.map((s: { id: string; text: string }) => ({ id: s.id, text: s.text })));
        // Simple hash function for string
        let hash = 0;
        for (let i = 0; i < contentString.length; i++) {
            const char = contentString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        const cacheKey = `analysis:${hash}:${lensId}: v5`;

        // Check cache first
        if (!forceRefresh) {
            const cachedAnalysis = await StorageService.getCache(userId, cacheKey);
            if (cachedAnalysis) {
                console.log('Returning cached analysis for key:', cacheKey);
                return NextResponse.json({
                    success: true,
                    analysis: cachedAnalysis
                });
            }
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Perform analysis using the service
        const analysisResult = await performCulturalAnalysis(userId, sources, lensId, openai);

        // Cache the result (7 days)
        await StorageService.setCache(userId, cacheKey, analysisResult, 60 * 60 * 24 * 7);

        return NextResponse.json({
            success: true,
            analysis: analysisResult,
        });

    } catch (error: unknown) {
        console.error('Cultural analysis error:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || 'Cultural analysis failed' },
            { status: 500 }
        );
    }
}
