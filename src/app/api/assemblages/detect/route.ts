import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { EcosystemActor } from '@/types/ecosystem';

// --- Type Definitions ---
interface DetectRequest {
    actors: EcosystemActor[];
    edges: { source: string; target: string; type: string }[];
}



interface AdjacencyList {
    [key: string]: {
        [target: string]: number;
    };
}

// --- Helper: Cosine Similarity ---
function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// --- Helper: Louvain Algorithm Implementation ---
// A simplified implementation of the Louvain method for modularity optimization
class Louvain {
    nodes: string[];
    adj: AdjacencyList;
    totalGraphWeight: number;
    nodeWeights: { [key: string]: number };
    communities: { [node: string]: number }; // node -> communityId
    communityWeights: { [comm: number]: number }; // tot (sum of weights of links incident to nodes in comm)
    internalWeights: { [comm: number]: number }; // in (sum of weights of links inside comm)

    constructor(nodes: string[], adj: AdjacencyList) {
        this.nodes = nodes;
        this.adj = adj;
        this.totalGraphWeight = 0;
        this.nodeWeights = {};
        this.communities = {};
        this.communityWeights = {};
        this.internalWeights = {};

        // Initialize
        nodes.forEach((node, i) => {
            this.communities[node] = i;
            this.internalWeights[i] = 0;

            // Calculate node weight (k_i)
            let w = 0;
            if (adj[node]) {
                Object.values(adj[node]).forEach(weight => {
                    w += weight;
                    // For the total graph weight, each undirected edge is counted twice here if the adj is symmetric
                    // We'll standardise that later.
                });
            }
            this.nodeWeights[node] = w;
            this.communityWeights[i] = w;
            this.totalGraphWeight += w;
        });

        this.totalGraphWeight /= 2; // m
    }

    // Helper to get weight between node and a community
    getWeightToCommunity(node: string, commId: number): number {
        let weight = 0;
        const neighbors = this.adj[node] || {};
        Object.entries(neighbors).forEach(([neighbor, w]) => {
            if (this.communities[neighbor] === commId) {
                weight += w;
            }
        });
        return weight;
    }

    run(maxPasses = 5) {
        let improvement = true;
        let passes = 0;

        while (improvement && passes < maxPasses) {
            improvement = false;
            passes++;

            // Randomize node order? (Optional, but good for stability)
            const shuffledNodes = [...this.nodes].sort(() => Math.random() - 0.5);

            shuffledNodes.forEach(node => {
                const currentComm = this.communities[node];
                const k_i = this.nodeWeights[node];
                const k_i_in_current = this.getWeightToCommunity(node, currentComm);

                // Remove node from current community
                this.communityWeights[currentComm] -= k_i;
                this.internalWeights[currentComm] -= (2 * k_i_in_current + (this.adj[node]?.[node] || 0)); // self loop handled?
                // Note: simple removal logic. 

                // Find best community
                let bestComm = currentComm;
                let bestGain = 0;

                // Check neighbors' communities
                const neighborComms = new Set<number>();
                const neighbors = this.adj[node] || {};
                Object.keys(neighbors).forEach(neighbor => neighborComms.add(this.communities[neighbor]));

                // Also always consider own isolated community? 
                // For simplicity in this phase 1 implementation, we move to neighbor communities.

                for (const commId of Array.from(neighborComms)) {
                    if (commId === currentComm) continue; // Skip if conceptually removed (logic above is slight approx)

                    const k_i_in = this.getWeightToCommunity(node, commId);
                    const tot = this.communityWeights[commId];

                    // Modularity Gain Formula (Simplified)
                    // Delta Q = [ (Sigma_in + k_i_in)/2m - ((Sigma_tot + k_i)/2m)^2 ] - [ Sigma_in/2m - (Sigma_tot/2m)^2 - (k_i/2m)^2 ]
                    // We just need to maximize: k_i_in - (tot * k_i) / m
                    const gain = k_i_in - (tot * k_i) / (2 * this.totalGraphWeight);

                    if (gain > bestGain) {
                        bestGain = gain;
                        bestComm = commId;
                    }
                }

                // If moving to bestComm is better than staying (which has 0 gain relative to removed state if optimal)
                // Actually we compared gains relative to *current* state.
                // Re-add to best comm
                this.communities[node] = bestComm;
                this.communityWeights[bestComm] += k_i;

                if (bestComm !== currentComm) {
                    improvement = true;
                }
            });
        }

        return this.communities;
    }
}

export async function POST(req: Request) {
    try {
        const { actors, edges } = await req.json() as DetectRequest;

        if (!actors || actors.length < 3) {
            return NextResponse.json({
                success: false,
                message: "Not enough actors for clustering."
            }, { status: 400 });
        }

        // 1. Initialize OpenAI
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // 2. Generate Embeddings (Batch)
        console.log(`Generating embeddings for ${actors.length} actors...`);
        const inputs = actors.map(a => `${a.name}: ${a.description || a.type}`);

        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: inputs,
        });

        const embeddings = embeddingResponse.data.map(d => d.embedding);

        // 3. Build Hybrid Weighted Graph
        // Edge Weight = Structural (1.0 for existing link) + Semantic (Cosine Similarity)
        const adj: AdjacencyList = {};

        // Initialize Adj
        actors.forEach(a => adj[a.id] = {});

        // Add Semantic Edges (All-to-All) - Thresholded
        const SIMILARITY_THRESHOLD = 0.4; // Only connect if minimally relevant
        const SEMANTIC_WEIGHT_FACTOR = 0.8;

        for (let i = 0; i < actors.length; i++) {
            for (let j = i + 1; j < actors.length; j++) {
                const sim = cosineSimilarity(embeddings[i], embeddings[j]);
                if (sim > SIMILARITY_THRESHOLD) {
                    const weight = sim * SEMANTIC_WEIGHT_FACTOR;
                    adj[actors[i].id][actors[j].id] = (adj[actors[i].id][actors[j].id] || 0) + weight;
                    adj[actors[j].id][actors[i].id] = (adj[actors[j].id][actors[i].id] || 0) + weight;
                }
            }
        }

        // Add Structural Edges (Reinforce Semantic)
        const STRUCTURAL_WEIGHT = 2.0;
        edges.forEach(e => {
            if (adj[e.source] && adj[e.target]) { // Check existence
                adj[e.source][e.target] = (adj[e.source][e.target] || 0) + STRUCTURAL_WEIGHT;
                adj[e.target][e.source] = (adj[e.target][e.source] || 0) + STRUCTURAL_WEIGHT;
            }
        });

        // 4. Run Louvain
        const louvain = new Louvain(actors.map(a => a.id), adj);
        const communityMap = louvain.run();

        // 5. Group Results
        const communities: { [id: string]: string[] } = {};
        Object.entries(communityMap).forEach(([nodeId, commId]) => {
            if (!communities[commId]) communities[commId] = [];
            communities[commId].push(nodeId);
        });

        // Limit to top 3 largest to save tokens on naming
        const topCommunityKeys = Object.keys(communities)
            .sort((a, b) => communities[b].length - communities[a].length)
            .slice(0, 3);

        // 6. Generate Descriptive Names (Batch)
        const namingPrompts = topCommunityKeys.map(commId => {
            const members = communities[commId];
            const memberDetails = members.map(id => {
                const a = actors.find(act => act.id === id);
                return `${a?.name} (${a?.type})`;
            }).join(', ');
            return `Group ${commId}: ${memberDetails}`;
        }).join('\n');

        const nameResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a sociologist analyzing socio-technical assemblages. Given a list of actors in a group, provide a SHORT, TEMATIC title (max 4 words) that describes their collective function or domain (e.g., 'Algorithmic Surveillance Network', 'EU Compliance Layer'). Return ONLY a JSON object mapping 'Group ID' to 'Title'." },
                { role: "user", content: `Name these groups:\n${namingPrompts}` }
            ],
            response_format: { type: "json_object" }
        });

        const names = JSON.parse(nameResponse.choices[0].message.content || "{}");

        // Format as Configurations
        const suggestions = topCommunityKeys.map(commId => {
            const members = communities[commId];
            const commActors = actors.filter(a => members.includes(a.id));
            const types = commActors.map(a => a.type);
            const distinctTypes = Array.from(new Set(types));

            // Calculate Diversity
            const diversityScore = distinctTypes.length / Math.min(members.length, 5);

            // Calculate Metrics
            const humanTypes = ['Policymaker', 'Civil Society', 'Academic', 'User', 'Technologist'];
            const humanCount = commActors.filter(a => humanTypes.some(t => a.type.includes(t))).length;
            const nonHumanCount = members.length - humanCount;

            // Use AI Name or Fallback
            const name = names[`Group ${commId}`] || names[commId] || `Assemblage ${commId}`;

            return {
                id: `sugg-${crypto.randomUUID()}`,
                name,
                memberIds: members,
                nodes: members,
                description: `AI-detected community of ${members.length} actors.`,
                type: "detected",
                diversityScore: Math.min(1.0, diversityScore),
                metrics: {
                    size: members.length,
                    humanCount,
                    nonHumanCount
                }
            };
        });

        return NextResponse.json({
            success: true,
            suggestions
        });

    } catch (error) {
        console.error("Assemblage Detection Error:", error);
        return NextResponse.json({ success: false, message: "Detection failed" }, { status: 500 });
    }
}
