import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import { RESISTANCE_DISCOURSE_ANALYSIS_PROMPT } from '@/lib/prompts/resistance-analysis';
import { ArtifactAnalysisResult, DiscourseFrame, RhetoricalStrategy, ReconfigurationAnalysis, ResistanceArtifact } from '@/types/resistance';
import { StorageService } from '@/lib/storage-service';
import { getAuthenticatedUserId } from '@/lib/auth-helper';

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
        console.log('[RESISTANCE ANALYSIS] Request Body:', JSON.stringify(body, null, 2));
        const { artifact_id, artifact_text, analysis_type } = body;

        if (!artifact_text) {
            console.error('[RESISTANCE ANALYSIS] Missing artifact_text');
            return NextResponse.json(
                { success: false, error: 'Artifact text is required' },
                { status: 400 }
            );
        }

        // Call OpenAI for discourse analysis
        console.log('Starting OpenAI analysis for artifact:', artifact_id);
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: RESISTANCE_DISCOURSE_ANALYSIS_PROMPT
                },
                {
                    role: 'user',
                    content: `Analyze this resistance artifact:\n\n${artifact_text}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        console.log('OpenAI completion received');
        const analysis = JSON.parse(completion.choices[0].message.content || '{}');
        console.log('Analysis parsed successfully');

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
                console.log(`Analysis persisted for artifact ${artifact_id}`);
            } else {
                console.warn(`Artifact ${artifact_id} not found in Redis, skipping persistence.`);
            }
        } catch (redisError) {
            console.error('Failed to persist analysis to Redis:', redisError);
            // Continue to return success to UI even if persistence fails, but log it
        }

        return NextResponse.json({
            success: true,
            analysis: result
        });

    } catch (error) {
        console.error('Error analyzing resistance artifact:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to analyze artifact', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
