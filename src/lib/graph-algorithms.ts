import { EcosystemActor, EcosystemEdge } from '@/types/ecosystem';

interface Node {
    id: string;
    type: string;
}

interface Edge {
    source: string;
    target: string;
    weight: number;
}

interface CommunityResult {
    communityId: number;
    nodes: string[];
    diversityScore: number;
    metrics: {
        humanCount: number;
        nonHumanCount: number;
        size: number;
    };
}

/**
 * Calculates the Shannon Diversity Index for a set of actors based on their types.
 * Formula: H = -sum(pi * ln(pi))
 */
export function calculateDiversityIndex(actors: EcosystemActor[]): number {
    if (actors.length === 0) return 0;

    const typeCounts: Record<string, number> = {};
    actors.forEach(actor => {
        // Group broadly into Socio-Technical Categories for meaningful diversity
        let category = 'Other';
        const type = actor.type.toLowerCase();

        if (['policymaker', 'civil society', 'academic', 'activist'].some(t => type.includes(t))) {
            category = 'Human/Social';
        } else if (['algorithm', 'dataset', 'infrastructure', 'technology', 'code'].some(t => type.includes(t))) {
            category = 'Non-Human/Technical';
        } else if (['law', 'legalobject', 'regulation'].some(t => type.includes(t))) {
            category = 'Institutional/Legal';
        } else if (['startup', 'corporation', 'market'].some(t => type.includes(t))) {
            category = 'Market/Economic';
        }

        typeCounts[category] = (typeCounts[category] || 0) + 1;
    });

    const total = actors.length;
    let entropy = 0;

    Object.values(typeCounts).forEach(count => {
        const p = count / total;
        if (p > 0) {
            entropy -= p * Math.log(p);
        }
    });

    // Normalize (Index usually 0 to ~1.5 for 4 categories). 
    // We normalize to 0-1 range assuming max 4 categories: max entropy ~1.38
    const maxEntropy = Math.log(4);
    return Math.min(1, entropy / maxEntropy);
}

/**
 * Detects communities using a simplified Louvain Modularity Algorithm.
 * Adapted for client-side synchronous execution on small-to-medium graphs.
 */
export function detectCommunitiesLouvain(
    actors: EcosystemActor[],
    edges: { source: string; target: string }[]
): CommunityResult[] {
    // 1. Initialize each node in its own community
    const nodeCommunities = new Map<string, number>();
    const communities = new Map<number, Set<string>>();
    let nextCommunityId = 0;

    actors.forEach(actor => {
        nodeCommunities.set(actor.id, nextCommunityId);
        communities.set(nextCommunityId, new Set([actor.id]));
        nextCommunityId++;
    });

    // adjacency list
    const adj: Record<string, string[]> = {};
    actors.forEach(a => adj[a.id] = []);
    edges.forEach(e => {
        // Handle both object and string references from d3
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = typeof e.source === 'object' ? (e.source as any).id : e.source;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = typeof e.target === 'object' ? (e.target as any).id : e.target;

        if (adj[s]) adj[s].push(t);
        if (adj[t]) adj[t].push(s);
    });

    // 2. Optimization Phase (Simplified: One pass Label Propagation with Modularity Heuristic)
    // Full Louvain is complex; a localized modularity greed is often sufficient for UI suggestions.
    // Iteratively move nodes to neighbor communities if it increases density.

    const m = edges.length; // Total edges (half-edges if undirected, but simplfied here)
    const twoM = m * 2;

    // Track total degree (sum of links) for each community
    const commTotDegree = new Map<number, number>();
    // Track degree of each node
    const nodeDegree: Record<string, number> = {};

    // Initialize degrees
    actors.forEach(a => {
        const d = adj[a.id]?.length || 0;
        nodeDegree[a.id] = d;
        commTotDegree.set(nodeCommunities.get(a.id)!, d);
    });

    let improvement = true;
    let iterations = 0;
    const MAX_ITERATIONS = 10;
    const RESOLUTION = 1.0; // Higher = smaller communities

    while (improvement && iterations < MAX_ITERATIONS) {
        improvement = false;
        iterations++;

        // Randomize order
        const shuffledActors = [...actors].sort(() => Math.random() - 0.5);

        for (const actor of shuffledActors) {
            const nodeId = actor.id;
            const currentComm = nodeCommunities.get(nodeId)!;
            const neighbors = adj[nodeId] || [];
            if (neighbors.length === 0) continue;

            const ki = nodeDegree[nodeId];

            // Remove from current community for calculation
            commTotDegree.set(currentComm, (commTotDegree.get(currentComm) || 0) - ki);
            // (Conceptually remove node, so we can see where it fits best as if it were free)

            // Calculate "best" community based on Modularity Gain
            // Gain = k_i_in - resolution * (Tot_c * k_i) / 2m

            const neighborCommWeights = new Map<number, number>();
            neighbors.forEach(nId => {
                const c = nodeCommunities.get(nId);
                // IF we allow self-loops, we'd handle it, but here simple graph
                if (c !== undefined) {
                    neighborCommWeights.set(c, (neighborCommWeights.get(c) || 0) + 1); // weight is 1
                }
            });

            // Consider staying in current (after conceptual removal, it is empty of this node,
            // but effectively we are comparing moving to C_current vs C_neighbor)
            // Actually simpler: Find max Delta Q for all neighbor communities + current (which has 0 gain if we don't move, but we calculated gain relative to being isolated)

            let bestComm = currentComm;
            // Best score starts with the score of returning to current community
            // k_in_current - res * (Tot_current * ki) / 2m
            const k_in_current = neighborCommWeights.get(currentComm) || 0;
            const tot_current = commTotDegree.get(currentComm) || 0;
            let maxGain = k_in_current - (RESOLUTION * tot_current * ki) / twoM;

            // Check all neighbor communities
            neighborCommWeights.forEach((k_in, commId) => {
                if (commId === currentComm) return;
                const tot_c = commTotDegree.get(commId) || 0;
                const gain = k_in - (RESOLUTION * tot_c * ki) / twoM;

                if (gain > maxGain) {
                    maxGain = gain;
                    bestComm = commId;
                }
            });

            // Apply move
            // Add back to (potentially new) community
            commTotDegree.set(bestComm, (commTotDegree.get(bestComm) || 0) + ki);

            if (bestComm !== currentComm) {
                // Update structure
                communities.get(currentComm)?.delete(nodeId);
                if (communities.get(currentComm)?.size === 0) communities.delete(currentComm);

                if (!communities.has(bestComm)) communities.set(bestComm, new Set());
                communities.get(bestComm)!.add(nodeId);
                nodeCommunities.set(nodeId, bestComm);

                improvement = true;
            }
        }
    }

    // 3. Format Results
    const results: CommunityResult[] = [];
    communities.forEach((members, commId) => {
        const memberIds = Array.from(members);
        // Filter tiny clusters (noise)
        if (memberIds.length < 3) return;

        const memberActors = actors.filter(a => memberIds.includes(a.id));
        const diversity = calculateDiversityIndex(memberActors);

        // Count rough types
        const humanCount = memberActors.filter(a =>
            ['policymaker', 'civil society', 'academic'].some(t => a.type.toLowerCase().includes(t))
        ).length;
        const nonHumanCount = memberActors.length - humanCount;

        results.push({
            communityId: commId,
            nodes: memberIds,
            diversityScore: diversity,
            metrics: {
                humanCount,
                nonHumanCount,
                size: memberActors.length
            }
        });
    });

    // Sort by Diversity (High to Low) then Size
    return results.sort((a, b) => (b.diversityScore * 2 + b.metrics.size) - (a.diversityScore * 2 + a.metrics.size));
}
