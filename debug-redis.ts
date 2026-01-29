
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config(); // Load .env.local if present, or just relying on environment

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log(`Connecting to Redis at ${redisUrl}...`);
const redis = new Redis(redisUrl);

async function debugRedis() {
    try {
        // Find all keys
        const keys = await redis.keys('*');
        console.log(`Found ${keys.length} total keys.`);

        // Filter for ecosystem actors
        const actorKeys = keys.filter(k => k.includes('ecosystem_actors'));
        console.log("\n--- Ecosystem Actor Keys ---");
        for (const key of actorKeys) {
            const type = await redis.type(key);
            let count = 0;
            if (type === 'string') {
                try {
                    const data = JSON.parse(await redis.get(key) || '[]');
                    count = Array.isArray(data) ? data.length : 0;
                } catch (e) { }
            }
            console.log(`${key} [${type}]: ${count} actors`);
        }

        // Filter for Deleted Baselines
        const deletedKeys = keys.filter(k => k.includes('deleted_baselines'));
        console.log("\n--- Deleted Baselines ---");
        for (const key of deletedKeys) {
            const val = await redis.get(key);
            console.log(`${key}: ${val}`);
        }

        // Filter for Sources
        const sourceKeys = keys.filter(k => k.includes('sources_v2'));
        console.log("\n--- Sources ---");
        for (const key of sourceKeys) {
            const val = await redis.hgetall(key);
            console.log(`${key}: ${Object.keys(val || {}).length} sources`);
            Object.values(val || {}).forEach((s: any) => {
                const parsed = JSON.parse(s);
                console.log(` - ${parsed.id}: ${parsed.title} (PolicyID: ${parsed.policyId || 'None'}) (Type: ${parsed.type})`);
            });
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        redis.disconnect();
    }
}

debugRedis();
