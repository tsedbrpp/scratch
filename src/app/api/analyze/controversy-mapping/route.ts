import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';
import { StorageService } from '@/lib/storage-service';
import { getSources } from '@/lib/store';
import { GhostNodeStore } from '@/lib/ghost-node-store';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { PromptRegistry } from '@/lib/prompts/registry';
import { ControversyMappingSchema } from '@/lib/prompts/controversy-mapping';
import { compressLensesForControversyMapping, RawLensData } from '@/lib/controversy-compression';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Allow maximum Vercel timeout for heavy synthesis

async function getEffectiveContext(req: NextRequest, userId: string) {
    const workspaceId = req.headers.get('x-workspace-id');
    const targetContext = workspaceId || userId;
    const access = await validateWorkspaceAccess(userId, targetContext);

    if (!access.allowed) {
        throw new Error('Access Denied to Workspace');
    }

    return { contextId: targetContext, role: access.role };
}

export async function POST(
    request: NextRequest,
) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { contextId } = await getEffectiveContext(request, userId);

        const body = await request.json();
        const { policyId, documentTitle, force } = body;

        if (!policyId) {
            return NextResponse.json({ success: false, error: 'Missing policyId' }, { status: 400 });
        }

        const titleToUse = documentTitle || policyId;

        // Check cache first if not forced
        if (!force) {
            const cachedMap = await StorageService.get(contextId, `controversy_mapping_${policyId}`);
            if (cachedMap) {
                return NextResponse.json({
                    success: true,
                    isPartial: (cachedMap as Record<string, unknown>).isPartial,
                    sourcesUsed: (cachedMap as Record<string, unknown>).sourcesUsed,
                    controversyMap: cachedMap
                });
            }
        }

        // 1. Fetch the Source object to get attached lenses
        const sources = await getSources(contextId);
        const source = sources.find(s => s.id === policyId);

        if (!source) {
            return NextResponse.json({ success: false, error: 'Source document not found' }, { status: 404 });
        }

        const cultural = source.cultural_framing;
        const institutional = source.institutional_logics;
        const abstractMachine = source.analysis?.abstract_machine;

        // 2. Fetch external strata from Redis / custom stores
        const [
            ghostNodes,
            actors,
            configurations,
            resistanceData,
            allComparisons
        ] = await Promise.all([
            GhostNodeStore.getGhostNodes(contextId, policyId),
            StorageService.get(contextId, `ecosystem_actors_${policyId}`),
            StorageService.get(contextId, `ecosystem_configurations_${policyId}`),
            StorageService.get(contextId, `resistance_synthesis_result_${policyId}`),
            StorageService.get<Record<string, any>>(contextId, `comparison_synthesis_results_v2`)
        ]);

        // Filter pairwise comparisons relevant to this policy
        const crossCaseExport = allComparisons
            ? Object.values(allComparisons).filter((comp: Record<string, unknown>) => typeof comp?.id === 'string' && comp.id.includes(policyId))
            : [];

        const rawData: RawLensData = {
            cultural,
            institutional,
            resistance: resistanceData as Record<string, unknown>,
            abstractMachine,
            actors: actors as unknown as Record<string, unknown>[],
            ghostNodes: ghostNodes as unknown as Record<string, unknown>[],
            configurations: configurations as unknown as Record<string, unknown>[],
            crossCaseExport: crossCaseExport.length > 0 ? crossCaseExport : null
        };

        // 2. Partial-Data Fallback Checks
        let availableCount = 0;
        const availableSources = [];
        for (const [key, val] of Object.entries(rawData)) {
            if (val !== null && val !== undefined && val !== "") {
                if (Array.isArray(val) && val.length === 0) continue;
                availableCount++;
                availableSources.push(key);
            }
        }

        if (availableCount < 3) {
            return NextResponse.json({
                success: false,
                isPartial: true,
                error: `Insufficient data points (${availableCount}). Please run at least 3 analysis lenses (e.g., Cultural Framing, Institutional Logics, Micro-Resistance) before attempting a Controversy Map. Found: ${availableSources.join(', ')}`,
                controversyMap: null
            }, { status: 400 });
        }

        // 3. Compress data aggressively to stay in context window limits
        const compressedJSON = compressLensesForControversyMapping(rawData);

        console.log(`[ControversyMapping] Extracted ${availableCount} lenses. Compressed token size approx: ${compressedJSON.length / 4} tokens.`);

        // 4. Run LLM
        const systemPrompt = await PromptRegistry.getEffectivePrompt(userId, 'controversy_mapping');
        const userPrompt = `Document: ${titleToUse}\n\nLenses Available: ${availableSources.join(', ')}\n\nCOMPRESSED LENS DATA:\n${compressedJSON}\n\nExecute Meta-Synthesis. Map the controversies and return structural JSON.`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-2024-08-06',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: zodResponseFormat(ControversyMappingSchema, 'controversyMap')
        });

        const content = completion.choices[0].message.content || '{}';

        let parsed;
        try {
            parsed = ControversyMappingSchema.parse(JSON.parse(content));
        } catch (parseError) {
            console.error("[ControversyMapping] LLM Output Parse Error. Raw content:", content);
            throw parseError;
        }

        // 5. Build final map with strict lineage metadata
        const controversyMap = {
            generatedAt: new Date().toISOString(),
            policyId,
            sourcesUsed: availableSources,
            isPartial: availableCount < 7, // If less than 7, inform the UI it's a partial map
            ...parsed
        };

        // Cache the result
        await StorageService.set(contextId, `controversy_mapping_${policyId}`, controversyMap);

        return NextResponse.json({
            success: true,
            isPartial: controversyMap.isPartial,
            sourcesUsed: availableSources,
            controversyMap
        });

    } catch (error: unknown) {
        console.error('[ControversyMappingRoute] Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate controversy map'
        }, { status: 500 });
    }
}
