const Redis = require('ioredis');
const path = require('path');
const fs = require('fs');

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    });
}

const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

async function clearCache() {
    console.log(`Connecting to Redis at ${redisUrl}...`);
    const redis = new Redis(redisUrl);

    try {
        console.log('Flushing all keys...');
        await redis.flushall();
        console.log('✅ Cache cleared successfully.');
    } catch (error) {
        console.error('❌ Failed to clear cache:', error);
    } finally {
        redis.disconnect();
    }
}

clearCache();
