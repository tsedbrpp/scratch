import { NextRequest, NextResponse } from 'next/server';
import { AssemblageMechanismService } from '@/lib/assemblage-mechanism-service';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { checkRateLimit } from '@/lib/ratelimit';
import { StorageService } from '@/lib/storage-service';
import { ProvisionalWrapper } from '@/lib/provisional-wrapper';

/**
 * POST /api/analyze/mechanisms
 * Assemblage Theory ontological analysis endpoint
 * 
 * This endpoint detects DeLandian mechanisms and capacities
 * REQUIRES ANT trace as input (layered approach)
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
        const { traced_actors, associations, configurations } = await request.json();

        // Validate that ANT trace is provided
        if (!traced_actors || !associations) {
            return NextResponse.json(
                {
                    error: 'Assemblage analysis requires ANT trace as input',
                    hint: 'Call /api/analyze/trace first, then pass traced_actors and associations to this endpoint'
                },
                { status: 400 }
            );
        }

        // Generate cache key
        const cacheKey = `assemblage_mechanisms:${traced_actors.length}:${associations.length}`;

        // Check cache
        const cached = await StorageService.getCache(userId, cacheKey);
        if (cached) {
            console.log('Returning cached assemblage analysis');
            return NextResponse.json(cached);
        }

        // Detect assemblage mechanisms (requires ANT trace as input)
        const mechanisms = AssemblageMechanismService.detectTerritorialization(
            traced_actors,
            associations,
            configurations || []
        );

        const deterritMechanisms = AssemblageMechanismService.detectDeterritorialization(
            traced_actors,
            associations
        );

        const capacities = AssemblageMechanismService.identifyCapacities(
            traced_actors,
            associations
        );

        // Generate explanatory narrative
        const narrativeContent = `Based on ${traced_actors.length} traced actors and ${associations.length} associations, detected ${mechanisms.length + deterritMechanisms.length} mechanisms and ${capacities.length} capacities.`;

        // Wrap narrative as provisional inscription
        const provisionalNarrative = ProvisionalWrapper.wrap(
            narrativeContent,
            "ai_generated",
            traced_actors.length > 10 ? 0.8 : 0.6 // Input completeness based on actor count
        );

        const result = {
            success: true,
            mode: "assemblage_realist",
            detected_mechanisms: [...mechanisms, ...deterritMechanisms],
            identified_capacities: capacities,
            explanatory_narrative: provisionalNarrative.content,
            provisional_status: provisionalNarrative,
            based_on_trace: {
                actor_count: traced_actors.length,
                association_count: associations.length
            },
            note: "This is an ontological explanation (Assemblage Theory) grounded in ANT traces"
        };

        // Cache result (24 hours)
        await StorageService.setCache(userId, cacheKey, result, 60 * 60 * 24);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Mechanism detection error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Mechanism detection failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
