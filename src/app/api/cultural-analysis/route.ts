import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import { checkRateLimit } from '@/lib/ratelimit';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for theme extraction
const THEME_EXTRACTION_PROMPT = `You are an expert qualitative researcher conducting a "grounded theory" analysis of policy documents.

Your goal is to identify "emic" themes—concepts and categories used by the actors themselves—rather than imposing generic "etic" categories.

Extract 5-10 key themes from the provided text. Each theme should be:
- A specific, theoretically rich concept (e.g., "anticipatory compliance" instead of just "compliance").
- Grounded in the specific language of the text.
- Relevant to the construction of legitimacy, authority, or social order.

Return ONLY a JSON array of objects, where each object has a 'theme' and a 'quote'.
Example: [{"theme": "technological inevitability", "quote": "AI adoption is not a choice but a necessity..."}, {"theme": "sovereign data control", "quote": "We must regain control over our digital borders..."}]`;

interface ThemeObject {
    theme: string;
    quote: string;
}

interface ThemeExtraction {
    sourceId: string;
    sourceTitle: string;
    themes: ThemeObject[];
}

interface Cluster {
    id: string;
    name: string;
    themes: string[];
    quotes: { text: string; source: string }[];
    sources: string[];
    centroid: number[];
    size: number;
    description?: string;
}

interface BridgingConcept {
    concept: string;
    explanation: string;
}

interface BridgingData {
    bridgingConcepts: BridgingConcept[];
    opportunity: string;
    policyImplication: string;
}

interface Hole {
    id?: string;
    clusterA: Cluster | string;
    clusterB: Cluster | string;
    distance: number;
    bridgingConcepts?: BridgingConcept[];
    opportunity?: string;
    policyImplication?: string;
}

// System prompt for bridging concept generation
const BRIDGING_PROMPT = `You are a sophisticated social theorist and policy architect.

You are analyzing a "structural hole" between two distinct discourse communities (Cluster A and Cluster B). Your task is to propose "bridging concepts" that could theoretically and practically connect these disconnected worlds.

Avoid generic management speak (e.g., "stakeholder collaboration"). Instead, propose novel, high-level theoretical or strategic concepts that resolve the tension between the two clusters.

Bridging concepts should:
- Synthesize the conflicting logics of Cluster A and Cluster B.
- Be "boundary objects"—flexible enough to be accepted by both sides but robust enough to maintain identity.
- Represent a genuine intellectual or policy innovation.

For EACH bridging concept, provide:
- The concept name (2-4 words, e.g., "Algorithmic Due Process", "Data Sovereignty Trusts").
- A brief explanation (1 sentence) of how it theoretically bridges the specific gap.

Also provide:
1. A description of the "Innovation Opportunity": What new form of governance or value creation is possible here?
2. A "Policy Implication": How should this bridge be institutionalized?

Return your response as JSON with this structure:
{
  "bridgingConcepts": [
    {"concept": "concept name", "explanation": "brief explanation of this bridging concept"},
    ...
  ],
  "opportunity": "Description of innovation potential",
  "policyImplication": "Actionable policy recommendation"
}`;

// Lens-specific prompt additions
const LENS_PROMPTS: Record<string, string> = {
    default: "",
    institutional_logics: `
    ADOPT AN INSTITUTIONAL LOGICS LENS.
    Focus specifically on identifying conflicting institutional logics (e.g., market vs. state, professional vs. corporate).
    Identify the "material practices" and "symbolic systems" that constitute these logics.
    Themes should reflect these underlying logics and their contradictions.`,
    critical_data_studies: `
    ADOPT A CRITICAL DATA STUDIES LENS.
    Focus on power dynamics, surveillance, data justice, and how data practices reinforce or challenge existing inequalities.
    Interrogate the "political economy of data" and "epistemic violence".
    Themes should reflect power relations, marginalization, and justice implications.`,
    actor_network_theory: `
    ADOPT AN ACTOR-NETWORK THEORY (ANT) LENS.
    Treat non-human actors (algorithms, databases, standards) as having agency.
    Focus on "translation" processes, "obligatory passage points", and how networks are stabilized or destabilized.
    Themes should reflect the agency of artifacts and the mechanics of association.`
};

// Helper function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// Helper function to perform hierarchical clustering
function hierarchicalClustering(
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

// Helper function to safely parse JSON from AI responses
function safeJSONParse<T>(text: string, fallback: T): T {
    try {
        // Remove markdown code blocks if present
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```\n?/g, '');
        }
        cleaned = cleaned.trim();

        return JSON.parse(cleaned);
    } catch (error) {
        console.error('JSON parse error:', error, 'Text:', text);
        return fallback;
    }
}

import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    let { userId } = await auth();

    // Check for demo user if not authenticated
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
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
        const sortedSourceIds = sources.map((s: { id: string }) => s.id).sort().join(',');
        const cacheKey = `user:${userId}:analysis:${sortedSourceIds}:${lensId}:v5`;

        // Check cache first
        try {
            const cachedAnalysis = await redis.get(cacheKey);
            if (cachedAnalysis && !forceRefresh) {
                console.log('Returning cached analysis for key:', cacheKey);
                return NextResponse.json({
                    success: true,
                    analysis: JSON.parse(cachedAnalysis)
                });
            }
        } catch (error) {
            console.error('Redis cache check failed:', error);
            // Continue without cache if Redis fails
        }

        // Construct the lens-aware prompt
        const lensPrompt = LENS_PROMPTS[lensId as keyof typeof LENS_PROMPTS] || "";
        const finalSystemPrompt = `${THEME_EXTRACTION_PROMPT}\n\n${lensPrompt}`;

        // Step 1: Extract themes from each source
        console.log('Extracting themes from sources...');
        const themeExtractions = await Promise.all(
            sources.map(async (source: { id: string; title: string; text: string }, index: number) => {
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

        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: allThemesText,
        });

        const embeddings = embeddingResponse.data.map((item) => item.embedding);

        // Step 3: Cluster themes
        console.log('Clustering themes...');
        const rawClusters = hierarchicalClustering(allThemeObjects, embeddings, sourceIds, 0.7);

        // Format clusters
        const clusters = rawClusters.map((cluster, i) => ({
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
        const potentialHoles = [];
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

        const holes = await Promise.all(
            topHoles.map(async (hole) => {
                try {
                    const bridgingResponse = await openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [
                            { role: 'system', content: BRIDGING_PROMPT },
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
                        clusterA: hole.clusterA.id,
                        clusterB: hole.clusterB.id,
                        distance: hole.distance,
                        bridgingConcepts: bridgingData.bridgingConcepts || [],
                        opportunity: bridgingData.opportunity || '',
                        policyImplication: bridgingData.policyImplication || '',
                    };
                } catch (error: unknown) {
                    console.error(`Error generating bridging concepts:`, (error as Error).message);
                    return {
                        id: `hole-${hole.clusterA.id}-${hole.clusterB.id}`,
                        clusterA: hole.clusterA.id,
                        clusterB: hole.clusterB.id,
                        distance: hole.distance,
                        bridgingConcepts: [],
                        opportunity: 'Error generating opportunity description',
                        policyImplication: 'Error generating policy implication',
                    };
                }
            })
        );

        console.log(`Cultural analysis complete. Found ${clusters.length} clusters and ${holes.length} cultural holes`);

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

        const analysisResult = {
            summary,
            clusters: clustersWithDescriptions,
            holes,
            timestamp: new Date().toISOString(),
        };

        // Cache the result
        try {
            await redis.set(cacheKey, JSON.stringify(analysisResult));
        } catch (error) {
            console.error('Failed to cache analysis result:', error);
        }

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
