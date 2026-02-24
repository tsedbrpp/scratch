import { DetectedGhostNode, InstitutionalLogics } from './types';

export function calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const tokenize = (s: string) => new Set(s.split(/\s+/).filter(t => t.length > 2));

    const tokens1 = Array.from(tokenize(normalize(str1)));
    const tokens2 = Array.from(tokenize(normalize(str2)));

    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    let overlap = 0;
    for (const t1 of tokens1) {
        for (const t2 of tokens2) {
            if (t1 === t2 || t1.includes(t2) || t2.includes(t1)) {
                overlap++;
                break; // Count each token match only once
            }
        }
    }

    return (overlap * 2) / (tokens1.length + tokens2.length);
}

export function isDuplicateConcept(ghostLabel: string, existingNodes: Array<{ label?: string; id?: string }>): boolean {
    if (!ghostLabel) return true; // Ignore empty labels

    const threshold = 0.75; // 75% similarity threshold
    return existingNodes.some(node => {
        const nodeLabel = node.label || node.id || '';
        if (!nodeLabel) return false;

        // Direct substring check first (very fast)
        if (ghostLabel.toLowerCase().includes(nodeLabel.toLowerCase()) ||
            nodeLabel.toLowerCase().includes(ghostLabel.toLowerCase())) {
            return true;
        }

        return calculateSimilarity(ghostLabel, nodeLabel) > threshold;
    });
}

export function detectGhostNodes(
    existingNodes: Array<{ label?: string; id?: string }>,
    institutionalLogics?: InstitutionalLogics,
    _documentType: string = "policy",
): DetectedGhostNode[] {
    // Only return AI-detected ghost nodes going forward.
    // Legacy heuristic fallbacks have been removed to ensure all nodes 
    // strictly utilize excerpt-backed structural analysis.
    const ghostNodes: DetectedGhostNode[] = [];
    return ghostNodes;
}

export function getCategoryColor(category: string): string {
    switch (category.toLowerCase()) {
        case 'civil society':
        case 'community':
            return '#10b981'; // emerald
        case 'state':
        case 'government':
        case 'regulator':
            return '#3b82f6'; // blue
        case 'market':
        case 'industry':
        case 'corporate':
            return '#8b5cf6'; // violet
        case 'academia':
        case 'research':
            return '#f59e0b'; // amber
        case 'marginalized':
        case 'vulnerable':
            return '#ef4444'; // red
        case 'technical':
        case 'infrastructure':
            return '#64748b'; // slate
        default:
            return '#9ca3af'; // gray
    }
}

export async function asyncBatchProcess<T, R>(items: T[], batchSize: number, processor: (batch: T[], index: number) => Promise<R[]>): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        console.warn(`[GHOST_NODES] Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(items.length / batchSize)}`);

        // Process concurrently within the batch using Promise.allSettled
        const batchPromises = batch.map((item, localIndex) => processor([item], i + localIndex));
        const settledResults = await Promise.allSettled(batchPromises);

        for (const result of settledResults) {
            if (result.status === 'fulfilled') {
                results.push(...result.value);
            } else {
                console.error("[GHOST_NODES] Batch item processing failed:", result.reason);
            }
        }
    }
    return results;
}

export function parseUserExpectedActors(input?: string): string[] {
    if (!input) return [];
    return [...new Set(
        input
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
    )].slice(0, 20);
}
