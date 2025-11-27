
import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl);

async function clearDb() {
    try {
        console.log(`Connecting to Redis at ${redisUrl}...`);
        await redis.flushall();
        console.log('Redis database cleared successfully.');
    } catch (error) {
        console.error('Failed to clear Redis:', error);
    } finally {
        redis.disconnect();
    }
}

clearDb();
