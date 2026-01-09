import { NextRequest, NextResponse } from 'next/server';
import { ANTTraceService } from '@/lib/ant-trace-service';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { checkRateLimit } from '@/lib/ratelimit';
import { StorageService } from '@/lib/storage-service';

/**
 * POST /api/analyze/trace
 * Pure ANT methodological tracing endpoint
 * 
 * This endpoint performs ONLY empirical tracing - no ontological claims
 */
export async function POST(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.success) {
        return NextResponse.json(
            { error: `Rate limit exceeded. Try again in ${rateLimit.reset} seconds.` },
            { status: 429 }
        );
    }

    try {
        const { actors, links, text } = await request.json();

        // Generate cache key
        const cacheKey = `ant_trace:${Buffer.from(text || '').toString('base64').substring(0, 50)}`;

        // Check cache
        const cached = await StorageService.getCache(userId, cacheKey);
        if (cached) {
            console.log('Returning cached ANT trace');
            return NextResponse.json(cached);
        }

        // Perform ANT tracing (pure methodological)
        const tracedActors = ANTTraceService.hydrateWithProvenance(
            actors || [],
            "ai_inference" // Would be determined by actual extraction method
        );

        const associations = ANTTraceService.traceAssociations(
            tracedActors,
            links || []
        );

        const result = ANTTraceService.generateTraceResult(
            tracedActors,
            associations,
            undefined // translation sequence would be generated here
        );

        // Cache result (24 hours)
        await StorageService.setCache(userId, cacheKey, result, 60 * 60 * 24);

        return NextResponse.json({
            success: true,
            ...result,
            note: "This is a methodological trace (ANT). For ontological explanation, use /api/analyze/mechanisms"
        });

    } catch (error) {
        console.error('ANT trace error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Trace generation failed. Check input completeness.',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
