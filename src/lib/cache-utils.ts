import crypto from 'crypto';

/**
 * Generate a deterministic hash from actor data for cache keys.
 * Uses canonical JSON representation to ensure consistent hashing.
 */
export function generateActorHash(actors: any[], context?: string): string {
    // Sort actors by ID to ensure consistent ordering
    const sortedActors = [...actors].sort((a, b) => {
        const idA = a.id || a.name || '';
        const idB = b.id || b.name || '';
        return idA.localeCompare(idB);
    });

    // Create canonical representation
    const canonical = {
        actors: sortedActors.map(a => ({
            id: a.id,
            name: a.name,
            type: a.type,
        })),
        context: context || '',
    };

    // Generate SHA-256 hash
    const jsonString = JSON.stringify(canonical);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Generate cache key for deterritorialization simulation
 */
export function getDeterritorializationCacheKey(userId: string, actorHash: string): string {
    return `user:${userId}:cache:deterritorialization:v1:${actorHash}`;
}

/**
 * Cache TTL in seconds (24 hours)
 */
export const DETERRITORIALIZATION_CACHE_TTL = 86400;
