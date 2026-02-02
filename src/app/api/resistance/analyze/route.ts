import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import { ArtifactAnalysisResult, DiscourseFrame, RhetoricalStrategy, ReconfigurationAnalysis, ResistanceArtifact } from '@/types/resistance';
import { StorageService } from '@/lib/storage-service';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { PromptRegistry } from '@/lib/prompts/registry';
import { logger } from '@/lib/logger';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        logger.debug('[RESISTANCE ANALYSIS] Request Body:', JSON.stringify(body, null, 2));
        const { artifact_id, artifact_text, analysis_type } = body;

        if (!artifact_text) {
            logger.error('[RESISTANCE ANALYSIS] Missing artifact_text');
            return NextResponse.json(
                { success: false, error: 'Artifact text is required' },
                { status: 400 }
            );
        }

        // Get prompt from registry
        const systemPrompt = await PromptRegistry.getEffectivePrompt(userId, 'resistance_discourse_analysis');

        // Call OpenAI for discourse analysis
        logger.debug('Starting OpenAI analysis for artifact:', artifact_id);
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `Analyze this resistance artifact:\n\n${artifact_text}`
                }
            ],
            response_format: { type: 'json_object' },
            max_completion_tokens: 1500
        });

        logger.debug('OpenAI completion received');
        const analysis = JSON.parse(completion.choices[0].message.content || '{}');
        logger.debug('Analysis parsed successfully');

        const result: ArtifactAnalysisResult = {
            artifact_id,
            frames: analysis.frames || [],
            strategies: analysis.rhetorical_strategies || [],
            reconfiguration: analysis.reconfiguration,
            generated_at: new Date().toISOString()
        };

        // Persist to Redis
        try {
            // Use StorageService for consistent user-scoped keys
            let artifacts = await StorageService.get<ResistanceArtifact[]>(userId, 'resistance_artifacts');
            if (!artifacts) artifacts = [];

            const artifactIndex = artifacts.findIndex(a => a.id === artifact_id);
            if (artifactIndex !== -1) {
                // Update existing artifact
                artifacts[artifactIndex] = {
                    ...artifacts[artifactIndex],
                    frames: result.frames,
                    rhetorical_strategies: result.strategies,
                    reconfiguration_potential: result.reconfiguration
                };

                await StorageService.set(userId, 'resistance_artifacts', artifacts);
                logger.debug(`Analysis persisted for artifact ${artifact_id}`);
            } else {
                logger.warn(`Artifact ${artifact_id} not found in Redis, skipping persistence.`);
            }
        } catch (redisError) {
            logger.error('Failed to persist analysis to Redis:', redisError);
            // Continue to return success to UI even if persistence fails, but log it
        }

        return NextResponse.json({
            success: true,
            analysis: result
        });

    } catch (error) {
        logger.error('Error analyzing resistance artifact:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to analyze artifact', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
