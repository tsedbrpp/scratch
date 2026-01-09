import { NextRequest, NextResponse } from 'next/server';
import { ANTTraceService } from '@/lib/ant-trace-service';
import { AssemblageMechanismService } from '@/lib/assemblage-mechanism-service';
import { ProvisionalWrapper } from '@/lib/provisional-wrapper';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { checkRateLimit } from '@/lib/ratelimit';
import { StorageService } from '@/lib/storage-service';

/**
 * POST /api/analyze/hybrid
 * Hybrid reflexive analysis endpoint
 * 
 * Combines ANT tracing with Assemblage ontology
 * Explicitly flags theoretical tensions
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
        const { actors, links, configurations, text } = await request.json();

        // Generate cache key
        const cacheKey = `hybrid_analysis:${Buffer.from(text || '').toString('base64').substring(0, 50)}`;

        // Check cache
        const cached = await StorageService.getCache(userId, cacheKey);
        if (cached) {
            console.log('Returning cached hybrid analysis');
            return NextResponse.json(cached);
        }

        // Step 1: ANT Trace (Methodological)
        const tracedActors = ANTTraceService.hydrateWithProvenance(
            actors || [],
            "ai_inference"
        );

        const associations = ANTTraceService.traceAssociations(
            tracedActors,
            links || []
        );

        const antTrace = ANTTraceService.generateTraceResult(
            tracedActors,
            associations
        );

        // Step 2: Assemblage Analysis (Ontological)
        const mechanisms = AssemblageMechanismService.detectTerritorialization(
            tracedActors,
            associations,
            configurations || []
        );

        const capacities = AssemblageMechanismService.identifyCapacities(
            tracedActors,
            associations
        );

        const assemblageAnalysis = {
            mode: "assemblage_realist" as const,
            detected_mechanisms: mechanisms,
            identified_capacities: capacities,
            based_on_trace: {
                actor_count: tracedActors.length,
                association_count: associations.length
            }
        };

        // Step 3: Theoretical Tensions (Reflexive)
        const theoreticalTensions = [
            {
                description: "Instrumentalizing ANT for DeLandian purposes",
                latour_would_reject: "Latour explicitly rejects ontological mechanisms and capacities",
                delanda_requires: "DeLanda's realism requires explanatory mechanisms grounded in empirical traces",
                our_instrumentalization: "We use ANT as methodological foundation for Assemblage ontology, acknowledging this departs from Latour's anti-theoretical stance"
            }
        ];

        // Step 4: Wrap as Provisional Inscription
        const narrativeContent = `Hybrid analysis combining ANT tracing (${tracedActors.length} actors, ${associations.length} associations) with Assemblage mechanisms (${mechanisms.length} detected). This instrumentalizes ANT for DeLandian purposes.`;

        const provisionalStatus = ProvisionalWrapper.wrap(
            narrativeContent,
            "ai_generated",
            0.7
        );

        const result = {
            success: true,
            mode: "hybrid_reflexive",
            ant_trace: antTrace,
            assemblage_analysis: assemblageAnalysis,
            theoretical_tensions: theoreticalTensions,
            provisional_status: provisionalStatus,
            note: "This hybrid analysis explicitly acknowledges theoretical tensions between ANT (method) and Assemblage (ontology)"
        };

        // Cache result (24 hours)
        await StorageService.setCache(userId, cacheKey, result, 60 * 60 * 24);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Hybrid analysis error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Hybrid analysis failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
