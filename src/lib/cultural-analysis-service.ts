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

// Helper function to calculate cosine similarity
export function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// Helper function to perform hierarchical clustering
export function hierarchicalClustering(
    themeObjects: { theme: string; quote: string; source: string }[],
    embeddings: number[][],
    sourceIds: string[],
    threshold: number = 0.7
): Array<{ themes: { theme: string; quote: string; source: string }[]; sources: string[]; centroid: number[] }> {
    // Start with each theme as its own cluster
    let clusters = themeObjects.map((obj, i) => ({
        themes: [obj],
        sources: [sourceIds[i]],
        embeddings: [embeddings[i]],
        centroid: embeddings[i],
    }));

    // Merge clusters until no more similar pairs
    let merged = true;
    while (merged && clusters.length > 1) {
        merged = false;
        let maxSimilarity = threshold;
        let mergeIndices: [number, number] | null = null;

        // Find most similar pair
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const similarity = cosineSimilarity(clusters[i].centroid, clusters[j].centroid);
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    mergeIndices = [i, j];
                }
            }
        }

        // Merge if found
        if (mergeIndices) {
            const [i, j] = mergeIndices;
            const newCluster = {
                themes: [...clusters[i].themes, ...clusters[j].themes],
                sources: [...new Set([...clusters[i].sources, ...clusters[j].sources])],
                embeddings: [...clusters[i].embeddings, ...clusters[j].embeddings],
                centroid: clusters[i].centroid.map((val, idx) =>
                    (val + clusters[j].centroid[idx]) / 2
                ),
            };
            clusters = [
                ...clusters.slice(0, i),
                ...clusters.slice(i + 1, j),
                ...clusters.slice(j + 1),
                newCluster,
            ];
            merged = true;
        }
    }

    return clusters;
}

export async function performCulturalAnalysis(
    userId: string,
    sources: { id: string; title: string; text: string }[],
    lensId: string,
    openai: OpenAI
): Promise<CulturalAnalysisResult> {

    // Construct the lens-aware prompt
    // Fetch prompts
    const themeExtractionPrompt = await PromptRegistry.getEffectivePrompt(userId, 'theme_extraction');
    const bridgingPrompt = await PromptRegistry.getEffectivePrompt(userId, 'bridging_concepts');
    const lensPrompt = await PromptRegistry.getEffectivePrompt(userId, `cultural_lens_${lensId}`) || '';

    const finalSystemPrompt = `${themeExtractionPrompt}\n\n${lensPrompt}`;

    // Step 1: Extract themes from each source
    console.log('Extracting themes from sources...');
    const themeExtractions = await Promise.all(
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
                console.log(`Raw themes response for ${source.title}:`, themesText.substring(0, 200));

                const themes = safeJSONParse<ThemeObject[]>(themesText, []);
                console.log(`Extracted ${themes.length} themes from ${source.title}`);

                return {
                    sourceId: source.id,
                    sourceTitle: source.title,
                    themes,
                };
            } catch (error: unknown) {
                console.error(`Error extracting themes from source ${source.title}:`, (error as Error).message);
                throw error;
            }
        })
    );

    // Step 2: Generate embeddings for all themes
    console.log('Generating embeddings...');
    const allThemesText: string[] = [];
    const allThemeObjects: { theme: string; quote: string; source: string }[] = [];
    const sourceIds: string[] = [];

    themeExtractions.forEach((extraction) => {
        extraction.themes.forEach((item: ThemeObject | string) => {
            // Handle both old (string) and new (object) formats for robustness
            const themeText = typeof item === 'string' ? item : item.theme;
            const quote = typeof item === 'string' ? '' : item.quote;

            allThemesText.push(themeText);
            allThemeObjects.push({ theme: themeText, quote, source: extraction.sourceTitle });
            sourceIds.push(extraction.sourceId);
        });
    });

    // Filter out empty themes
    const validThemes = allThemesText.filter(t => t && t.trim().length > 0);

    if (validThemes.length === 0) {
        console.log('No valid themes found in sources.');
        return {
            summary: "No themes could be extracted from the provided sources. Please ensure the documents contain sufficient text content.",
            clusters: [],
            holes: [],
            timestamp: new Date().toISOString(),
        } as CulturalAnalysisResult;
    }

    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: validThemes,
    });

    const embeddings = embeddingResponse.data.map((item) => item.embedding);

    // Step 3: Cluster themes
    console.log('Clustering themes...');
    const rawClusters = hierarchicalClustering(allThemeObjects, embeddings, sourceIds, 0.7);

    // Format clusters
    const clusters: DiscourseCluster[] = rawClusters.map((cluster, i) => ({
        id: `cluster-${i}`,
        name: cluster.themes[0].theme, // Use first theme as cluster name
        themes: cluster.themes.map(t => t.theme), // Keep simple string array for compatibility if needed
        quotes: cluster.themes.map(t => ({ text: t.quote, source: t.source })).filter(q => q.text), // Extract quotes with source
        sources: cluster.sources,
        centroid: cluster.centroid,
        size: cluster.themes.length,
    }));

    // Generate descriptions for each cluster
    console.log('Generating cluster descriptions...');
    const clustersWithDescriptions = await Promise.all(
        clusters.map(async (cluster) => {
            try {
                const descriptionResponse = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert in discourse analysis and policy research. Given a list of related themes, provide a single concise sentence (max 15 words) that defines what this discourse cluster represents. Examples: "regulatory copying policies", "grand societal challenges", "diversity-coherence paradox", "enactment fields". Focus on identifying the conceptual pattern or theoretical category.`
                        },
                        {
                            role: 'user',
                            content: `Themes: ${cluster.themes.join(', ')}`
                        }
                    ],
                    temperature: 0.3,
                });

                const description = descriptionResponse.choices[0].message.content?.trim() || cluster.name;
                return { ...cluster, description };
            } catch (error) {
                console.error(`Error generating description for cluster ${cluster.id}:`, error);
                return { ...cluster, description: cluster.name };
            }
        })
    );

    // Step 4: Identify cultural holes (gaps between clusters)
    console.log('Identifying cultural holes...');
    const potentialHoles: {
        clusterA: DiscourseCluster;
        clusterB: DiscourseCluster;
        distance: number;
    }[] = [];
    const holeThreshold = 0.4; // Clusters with similarity < 0.4 are considered "holes"

    for (let i = 0; i < clustersWithDescriptions.length; i++) {
        for (let j = i + 1; j < clustersWithDescriptions.length; j++) {
            const similarity = cosineSimilarity(clustersWithDescriptions[i].centroid, clustersWithDescriptions[j].centroid);
            const distance = 1 - similarity;

            if (distance > holeThreshold) {
                potentialHoles.push({
                    clusterA: clustersWithDescriptions[i],
                    clusterB: clustersWithDescriptions[j],
                    distance: parseFloat(distance.toFixed(3)),
                });
            }
        }
    }

    // Sort by distance and only generate bridging concepts for top 3 largest gaps
    potentialHoles.sort((a, b) => b.distance - a.distance);
    const topHoles = potentialHoles.slice(0, 3);

    console.log(`Found ${potentialHoles.length} potential holes, generating bridging concepts for top ${topHoles.length}`);

    const holes: CulturalHole[] = await Promise.all(
        topHoles.map(async (hole) => {
            try {
                const bridgingResponse = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: bridgingPrompt },
                        {
                            role: 'user',
                            content: `Cluster A themes: ${hole.clusterA.themes.join(', ')}\n\nCluster B themes: ${hole.clusterB.themes.join(', ')}`,
                        },
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
            } catch (error: unknown) {
                console.error(`Error generating bridging concepts:`, (error as Error).message);
                return {
                    id: `hole-${hole.clusterA.id}-${hole.clusterB.id}`,
                    clusterA: hole.clusterA.name,
                    clusterB: hole.clusterB.name,
                    distance: hole.distance,
                    bridgingConcepts: [],
                    opportunity: 'Error generating opportunity description',
                    policyImplication: 'Error generating policy implication',
                };
            }
        })
    );

    console.log(`Cultural analysis complete. Found ${clusters.length} clusters and ${holes.length} cultural holes`);

    // Step 4b: Detect Silences (Cultural-Hole Detector)
    console.log('Detecting silences (missing stakeholders)...');
    // Combine all source text for silence detection
    const combinedText = sources.map((s) => s.text).join(' ');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const silences = detectSilences(combinedText) as any[]; // Casting due to potential type mismatch in ontology.ts
    console.log(`Found ${silences.length} silences.`);

    // Step 4c: Analyze Cultural Framing (Assemblage Analysis)
    // We run this on the combined text to see the framing of the "whole" discourse field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cultural_framing: any = undefined;
    if (lensId === 'dsf_lens' || lensId === 'institutional_logics') {
        console.log('Running Cultural Framing analysis...');
        try {
            const framingResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: CULTURAL_FRAMING_PROMPT },
                    { role: 'user', content: combinedText.substring(0, 15000) } // Limit text length
                ],
                temperature: 0.4,
                response_format: { type: "json_object" }
            });

            if (framingResponse.choices[0].message.content) {
                cultural_framing = JSON.parse(framingResponse.choices[0].message.content);
            }
        } catch (error) {
            console.error("Error generating cultural framing:", error);
        }
    }

    // Step 5: Generate overall summary
    console.log('Generating overall summary...');
    let summary = "";
    try {
        const summaryResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert in cultural sociology and innovation ecosystems. 
                    Summarize the key findings of this cultural analysis in 2-3 sentences.
                    Focus on the main discourse clusters identified and the most significant cultural hole (gap) between them.
                    Highlight the potential for innovation or policy intervention.`
                },
                {
                    role: 'user',
                    content: `Analysis Results:
                    Clusters: ${clustersWithDescriptions.map(c => c.name).join(', ')}
                    Top Cultural Hole: ${holes.length > 0 ? `Between ${holes[0].clusterA} and ${holes[0].clusterB} (Distance: ${holes[0].distance})` : "None found"}
                    Bridging Concepts: ${holes.length > 0 && holes[0].bridgingConcepts ? holes[0].bridgingConcepts.map((bc: BridgingConcept) => bc.concept).join(', ') : "N/A"}`
                }
            ],
            temperature: 0.5,
        });
        summary = summaryResponse.choices[0].message.content || "";
    } catch (error) {
        console.error("Error generating summary:", error);
        summary = "Summary generation failed.";
    }

    // Calculate Overall Connectivity Score
    let overall_connectivity_score = 1.0;
    if (clustersWithDescriptions.length > 1) {
        let totalSimilarity = 0;
        let pairCount = 0;
        for (let i = 0; i < clustersWithDescriptions.length; i++) {
            for (let j = i + 1; j < clustersWithDescriptions.length; j++) {
                const similarity = cosineSimilarity(clustersWithDescriptions[i].centroid, clustersWithDescriptions[j].centroid);
                totalSimilarity += similarity;
                pairCount++;
            }
        }
        if (pairCount > 0) {
            overall_connectivity_score = totalSimilarity / pairCount;
        }
    }

    return {
        summary,
        clusters: clustersWithDescriptions,
        holes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        silences: silences as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cultural_framing: cultural_framing as any,
        overall_connectivity_score, // Added return
        timestamp: new Date().toISOString(),
    };
}
