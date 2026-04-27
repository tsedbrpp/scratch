import type { DetectedGhostNode, GhostPathway, ScoreVersion } from './types';

/**
 * GNDP v1.1 compatibility normalizer.
 *
 * Infers missing v1.1 fields for cached v1.0 ghost node results.
 * Ensures UI components can safely access ghostPathway and analysisVersion
 * without scattered null checks.
 */
function inferLegacyPathway(node: Partial<DetectedGhostNode>): GhostPathway {
    // If explicitly proxy-represented, classify as proxy pathway
    if (node.representationType === 'Proxy') return 'proxy';
    // Default v1.0 nodes to structural pathway
    return 'structural';
}

export function normalizeGhostNode(node: Partial<DetectedGhostNode>): DetectedGhostNode {
    return {
        ...node,
        ghostPathway: node.ghostPathway ?? inferLegacyPathway(node),
        analysisVersion: node.analysisVersion ?? ('gndp-v1.0' as ScoreVersion),
    } as DetectedGhostNode;
}

/**
 * Normalize an array of ghost nodes, handling mixed v1.0/v1.1 results.
 */
export function normalizeGhostNodes(nodes: Partial<DetectedGhostNode>[]): DetectedGhostNode[] {
    return nodes.map(normalizeGhostNode);
}
