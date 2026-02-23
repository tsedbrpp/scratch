import Redis from 'ioredis';

const getRedisClient = () => {
    if (process.env.REDIS_URL) {
        return new Redis(process.env.REDIS_URL);
    }

    console.warn('REDIS_URL is not defined. Using dummy in-memory fallback.');
    const memCache = new Map();
    // Proxy intercepts any redis method and simulates it safely
    return new Proxy({}, {
        get(target, prop) {
            if (prop === 'get') return async (k: string) => memCache.get(k) || null;
            if (prop === 'set') return async (k: string, v: string) => memCache.set(k, v);
            if (prop === 'del') return async (k: string) => memCache.delete(k);
            if (prop === 'hgetall') return async () => ({});
            if (prop === 'hset') return async () => 1;
            if (prop === 'hdel') return async () => 1;
            if (prop === 'pipeline') return () => ({ set: () => { }, exec: async () => [] });
            if (prop === 'on') return () => { }; // for .on('error')
            return async () => null;
        }
    }) as unknown as Redis;
};

// Use a global variable to preserve the client across hot reloads in development
// and serverless function invocations where the container is reused.
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
    globalForRedis.redis ||
    getRedisClient();

// Prevent unhandled error events from crashing the process
redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}
