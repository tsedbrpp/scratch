import { redis } from '@/lib/redis';

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    error?: string; // Added for specific error messages
}

/**
 * Checks if a user has exceeded their rate limit OR hard cap.
 * Uses a fixed window counter for rate limit and a persistent counter for hard cap.
 * 
 * @param userId - The unique identifier for the user (or IP).
 * @param defaultLimit - The default maximum number of requests allowed within the window.
 * @param windowSeconds - The time window in seconds (default: 60).
 * @param defaultCap - The default total lifetime requests allowed (default: 100).
 * @returns Promise<RateLimitResult>
 */
export async function checkRateLimit(
    userId: string,
    defaultLimit: number = 25,
    windowSeconds: number = 60,
    defaultCap: number = 5000
): Promise<RateLimitResult> {
    const key = `ratelimit:user:${userId}`;
    const configKey = `config:ratelimit:user:${userId}:limit`;

    const totalKey = `usage:user:${userId}:total`;
    const capConfigKey = `config:usage:user:${userId}:cap`;

    try {
        // --- HARD CAP CHECK ---
        const overrideCap = await redis.get(capConfigKey);
        const cap = overrideCap ? parseInt(overrideCap, 10) : defaultCap;

        // Increment total usage
        const totalUsage = await redis.incr(totalKey);

        if (totalUsage > cap) {
            return {
                success: false,
                limit: cap,
                remaining: 0,
                reset: 0, // No reset for hard cap
                error: 'Quota Exceeded'
            };
        }

        // --- RATE LIMIT CHECK ---
        // 1. Check for user-specific limit override
        const overrideLimit = await redis.get(configKey);
        const limit = overrideLimit ? parseInt(overrideLimit, 10) : defaultLimit;

        // 2. Increment request count
        const requests = await redis.incr(key);

        // 3. Set expiration if this is the first request
        if (requests === 1) {
            await redis.expire(key, windowSeconds);
        }

        // 4. Get time to live (TTL) for reset time
        const ttl = await redis.ttl(key);
        const reset = Date.now() + (ttl * 1000);

        // 5. Check if limit exceeded
        const success = requests <= limit;
        const remaining = Math.max(0, limit - requests);

        return {
            success,
            limit,
            remaining,
            reset
        };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // Fail open (allow request) if Redis is down
        return {
            success: true,
            limit: defaultLimit,
            remaining: 1,
            reset: Date.now() + (windowSeconds * 1000)
        };
    }
}

/**
 * Sets a custom rate limit for a specific user.
 * 
 * @param userId - The user ID.
 * @param limit - The new limit (pass null or 0 to remove override).
 */
export async function setRateLimitOverride(userId: string, limit: number | null): Promise<void> {
    const configKey = `config:ratelimit:user:${userId}:limit`;
    if (limit === null || limit === 0) {
        await redis.del(configKey);
    } else {
        await redis.set(configKey, limit.toString());
    }
}

/**
 * Sets a custom hard cap for a specific user.
 */
export async function setHardCapOverride(userId: string, cap: number | null): Promise<void> {
    const configKey = `config:usage:user:${userId}:cap`;
    if (cap === null || cap === 0) {
        await redis.del(configKey);
    } else {
        await redis.set(configKey, cap.toString());
    }
}

/**
 * Gets the current rate limit configuration for a user.
 */
export async function getUserRateLimitConfig(userId: string): Promise<{ limit: number | null, cap: number | null }> {
    const limitKey = `config:ratelimit:user:${userId}:limit`;
    const capKey = `config:usage:user:${userId}:cap`;

    const [limit, cap] = await Promise.all([
        redis.get(limitKey),
        redis.get(capKey)
    ]);

    return {
        limit: limit ? parseInt(limit, 10) : null,
        cap: cap ? parseInt(cap, 10) : null
    };
}

/**
 * Resets the current usage for a user.
 */
export async function resetUserUsage(userId: string): Promise<void> {
    const key = `ratelimit:user:${userId}`;
    const totalKey = `usage:user:${userId}:total`;
    await Promise.all([
        redis.del(key),
        redis.del(totalKey)
    ]);
}
