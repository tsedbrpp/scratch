import Redis from 'ioredis';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    throw new Error('REDIS_URL is not defined');
};

// Use a global variable to preserve the client across hot reloads in development
// and serverless function invocations where the container is reused.
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
    globalForRedis.redis ||
    new Redis(getRedisUrl());

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}
