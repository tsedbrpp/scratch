import OpenAI from 'openai';
import { PromptRegistry } from '@/lib/prompts/registry';
import { safeJSONParse } from '@/lib/analysis-utils';
import { detectSilences } from '@/lib/ontology';
import { CULTURAL_FRAMING_PROMPT } from '@/lib/prompts/cultural-framing';
import {
    ThemeObject,
    BridgingConcept,
    BridgingData,
    DiscourseCluster,
    CulturalHole,
    CulturalAnalysisResult
} from '@/types/cultural';

import { cosineSimilarity, hierarchicalClustering } from '@/lib/clustering-utils';

// (Functions extracted to clustering-utils.ts)

export async function performCulturalAnalysis(
    userId: string,
    sources: { id: string; title: string; text: string }[],
    lensId: string,
    openai: OpenAI
): Promise<CulturalAnalysisResult> {

    // Step 1: Extract Themes
    const themeExtractions = await extractThemes(userId, sources, lensId, openai);

    // Step 2: Embeddings
    const { validThemes, allThemeObjects, sourceIds } = await generateThemeEmbeddings(themeExtractions, openai);

    if (validThemes.length === 0) {
        console.log('No valid themes found in sources.');
        return {
            summary: "No themes could be extracted from the provided sources. Please ensure the documents contain sufficient text content.",
            clusters: [],
            holes: [],
            timestamp: new Date().toISOString(),
        } as CulturalAnalysisResult;
    }

    // Step 3: Clustering
    const clustersWithDescriptions = await clusterThemes(allThemeObjects, validThemes, sourceIds, openai);

    // Step 4: Cultural Holes
    const holes = await identifyCulturalHoles(userId, clustersWithDescriptions, openai);

    // Step 5: Silences & Framing
    console.log('Detecting silences (missing stakeholders)...');
    const combinedText = sources.map((s) => s.text).join(' ');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const silences = detectSilences(combinedText) as any[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cultural_framing: any = undefined;
    if (lensId === 'dsf_lens' || lensId === 'institutional_logics') {
        cultural_framing = await analyzeCulturalFraming(combinedText, openai);
    }

    // Step 6: Summary
    const summary = await generateAnalysisSummary(clustersWithDescriptions, holes, openai);

    // Calculate Connectivity
    const overall_connectivity_score = calculateConnectivity(clustersWithDescriptions);

    return {
        summary,
        clusters: clustersWithDescriptions,
        holes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        silences: silences as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cultural_framing: cultural_framing as any,
        overall_connectivity_score,
        timestamp: new Date().toISOString(),
    };
}

// ------------------------------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------------------------------

async function extractThemes(userId: string, sources: { id: string; title: string; text: string }[], lensId: string, openai: OpenAI) {
    const themeExtractionPrompt = await PromptRegistry.getEffectivePrompt(userId, 'theme_extraction');
    const lensPrompt = await PromptRegistry.getEffectivePrompt(userId, `cultural_lens_${lensId}`) || '';
    const finalSystemPrompt = `${themeExtractionPrompt}\n\n${lensPrompt}`;

    console.log('Extracting themes from sources...');
    return Promise.all(
        sources.map(async (source, index) => {
            try {
                console.log(`Extracting themes from source ${index + 1}/${sources.length}: ${source.title}`);
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: finalSystemPrompt },
                        { role: 'user', content: source.text.substring(0, 4000) },
                    ],
                    temperature: 0.3,
                });
                const themesText = response.choices[0].message.content || '[]';
                const themes = safeJSONParse<ThemeObject[]>(themesText, []);
                return { sourceId: source.id, sourceTitle: source.title, themes };
            } catch (error: unknown) {
                console.error(`Error extracting themes from source ${source.title}:`, (error as Error).message);
                throw error;
            }
        })
    );
}

async function generateThemeEmbeddings(themeExtractions: { sourceId: string; sourceTitle: string; themes: ThemeObject[] }[], openai: OpenAI) {
    console.log('Generating embeddings...');
    const allThemesText: string[] = [];
    const allThemeObjects: { theme: string; quote: string; source: string }[] = [];
    const sourceIds: string[] = [];

    themeExtractions.forEach((extraction) => {
        extraction.themes.forEach((item: ThemeObject | string) => {
            const themeText = typeof item === 'string' ? item : item.theme;
            const quote = typeof item === 'string' ? '' : item.quote;
            allThemesText.push(themeText);
            allThemeObjects.push({ theme: themeText, quote, source: extraction.sourceTitle });
            sourceIds.push(extraction.sourceId);
        });
    });

    const validThemes = allThemesText.filter(t => t && t.trim().length > 0);
    return { validThemes, allThemeObjects, sourceIds };
}

async function clusterThemes(allThemeObjects: { theme: string; quote: string; source: string }[], validThemes: string[], sourceIds: string[], openai: OpenAI) {
    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: validThemes,
    });
    const embeddings = embeddingResponse.data.map((item) => item.embedding);

    console.log('Clustering themes...');
    const rawClusters = hierarchicalClustering(allThemeObjects, embeddings, sourceIds, 0.7);

    const clusters: DiscourseCluster[] = rawClusters.map((cluster, i) => ({
        id: `cluster-${i}`,
        name: cluster.themes[0].theme,
        themes: cluster.themes.map(t => t.theme),
        quotes: cluster.themes.map(t => ({ text: t.quote, source: t.source })).filter(q => q.text),
        sources: cluster.sources,
        centroid: cluster.centroid,
        size: cluster.themes.length,
    }));

    console.log('Generating cluster descriptions...');
    return Promise.all(
        clusters.map(async (cluster) => {
            try {
                const descriptionResponse = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: `You are an expert in discourse analysis. Provide a concise 15-word definition of this discourse cluster.` },
                        { role: 'user', content: `Themes: ${cluster.themes.join(', ')}` }
                    ],
                    temperature: 0.3,
                });
                const description = descriptionResponse.choices[0].message.content?.trim() || cluster.name;
                return { ...cluster, description };
            } catch {
                return { ...cluster, description: cluster.name };
            }
        })
    );
}

async function identifyCulturalHoles(userId: string, clusters: DiscourseCluster[], openai: OpenAI) {
    console.log('Identifying cultural holes...');
    const potentialHoles = [];
    const holeThreshold = 0.4;

    for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
            const similarity = cosineSimilarity(clusters[i].centroid, clusters[j].centroid);
            const distance = 1 - similarity;
            if (distance > holeThreshold) {
                potentialHoles.push({ clusterA: clusters[i], clusterB: clusters[j], distance: parseFloat(distance.toFixed(3)) });
            }
        }
    }

    potentialHoles.sort((a, b) => b.distance - a.distance);
    const topHoles = potentialHoles.slice(0, 3);
    const bridgingPrompt = await PromptRegistry.getEffectivePrompt(userId, 'bridging_concepts');

    return Promise.all(
        topHoles.map(async (hole) => {
            try {
                const bridgingResponse = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: bridgingPrompt },
                        { role: 'user', content: `Cluster A: ${hole.clusterA.themes.join(', ')}\nCluster B: ${hole.clusterB.themes.join(', ')}` },
                    ],
                    temperature: 0.5,
                });
                const bridgingData = safeJSONParse<BridgingData>(
                    bridgingResponse.choices[0].message.content || '{}',
                    { bridgingConcepts: [], opportunity: '', policyImplication: '' }
                );
                return {
                    id: `hole-${hole.clusterA.id}-${hole.clusterB.id}`,
                    clusterA: hole.clusterA.name,
                    clusterB: hole.clusterB.name,
                    distance: hole.distance,
                    bridgingConcepts: bridgingData.bridgingConcepts || [],
                    opportunity: bridgingData.opportunity || '',
                    policyImplication: bridgingData.policyImplication || '',
                };
            } catch {
                return {
                    id: `hole-${hole.clusterA.id}`,
                    clusterA: hole.clusterA.name,
                    clusterB: hole.clusterB.name,
                    distance: hole.distance,
                    bridgingConcepts: [],
                    opportunity: 'Error',
                    policyImplication: 'Error'
                };
            }
        })
    );
}

async function analyzeCulturalFraming(text: string, openai: OpenAI) {
    console.log('Running Cultural Framing analysis...');
    try {
        const framingResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: CULTURAL_FRAMING_PROMPT },
                { role: 'user', content: text.substring(0, 15000) }
            ],
            temperature: 0.4,
            response_format: { type: "json_object" }
        });
        if (framingResponse.choices[0].message.content) {
            return JSON.parse(framingResponse.choices[0].message.content);
        }
    } catch (error) {
        console.error("Error generating cultural framing:", error);
    }
    return undefined;
}

async function generateAnalysisSummary(clusters: DiscourseCluster[], holes: CulturalHole[], openai: OpenAI) {
    console.log('Generating overall summary...');
    try {
        const summaryResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Summarize the key findings of this cultural analysis in 2-3 sentences. Focus on clusters and holes.`
                },
                {
                    role: 'user',
                    content: `Clusters: ${clusters.map(c => c.name).join(', ')}\nTop Hole: ${holes.length > 0 ? `${holes[0].clusterA} vs ${holes[0].clusterB}` : "None"}`
                }
            ],
            temperature: 0.5,
        });
        return summaryResponse.choices[0].message.content || "";
    } catch {
        return "Summary generation failed.";
    }
}

function calculateConnectivity(clusters: DiscourseCluster[]) {
    let overall_connectivity_score = 1.0;
    if (clusters.length > 1) {
        let totalSimilarity = 0;
        let pairCount = 0;
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const similarity = cosineSimilarity(clusters[i].centroid, clusters[j].centroid);
                totalSimilarity += similarity;
                pairCount++;
            }
        }
        if (pairCount > 0) {
            overall_connectivity_score = totalSimilarity / pairCount;
        }
    }
    return overall_connectivity_score;
}
