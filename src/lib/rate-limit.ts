import { redis } from './redis';

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Basic Fixed Window Rate Limiter
 * @param identifier Unique identifier (user ID or IP)
 * @param limit Max requests per window
 * @param windowSeconds Window duration in seconds
 */
export async function checkRateLimit(
    identifier: string,
    limit: number = 10,
    windowSeconds: number = 60
): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;

    // Pipeline for atomic operation
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.ttl(key);

    const results = await pipeline.exec();

    if (!results) {
        throw new Error("Redis pipeline failed");
    }

    const count = results[0][1] as number;
    const ttl = results[1][1] as number;

    // If key is new (ttl = -1), set expiration
    if (count === 1 && ttl === -1) {
        await redis.expire(key, windowSeconds);
    }

    // Recover TTL if it was lost (race condition or weird state)
    if (count > 1 && ttl === -1) {
        await redis.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - count);
    const success = count <= limit;
    const reset = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

    return {
        success,
        limit,
        remaining,
        reset
    };
}
