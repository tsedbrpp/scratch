import Redis from 'ioredis';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }

    // During build time or if not configured, return a dummy URL to prevent crash
    // The actual connection will fail if used, but it allows the app to build.
    if (process.env.NODE_ENV === 'production') {
        console.warn('REDIS_URL is not defined. Using dummy URL for build.');
        return 'redis://localhost:6379';
    }

    throw new Error('REDIS_URL is not defined');
};

// Use a global variable to preserve the client across hot reloads in development
// and serverless function invocations where the container is reused.
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
    globalForRedis.redis ||
    new Redis(getRedisUrl());

// Prevent unhandled error events from crashing the process
redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}
