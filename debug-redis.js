
const Redis = require('ioredis');

const redisUrl = 'redis://localhost:6379';
console.log(`Connecting to Redis...`);
const redis = new Redis(redisUrl);

async function debugRedis() {
    try {
        const keys = await redis.keys('*');
        console.log(`Found ${keys.length} total keys.`);

        const actorKeys = keys.filter(k => k.includes('ecosystem_actors'));
        console.log("\n--- Ecosystem Actor Keys ---");
        for (const key of actorKeys) {
            const data = await redis.get(key);
            console.log(`${key}: ${data ? data.length + ' chars' : 'null'}`);
        }

        const sourceKeys = keys.filter(k => k.includes('sources_v2'));
        console.log("\n--- Sources ---");
        for (const key of sourceKeys) {
            const val = await redis.hgetall(key);
            const count = Object.keys(val).length;
            console.log(`${key}: ${count} sources`);
            if (count > 0 && count < 20) {
                console.log(Object.values(val).map(s => JSON.parse(s).title));
            }
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        redis.disconnect();
    }
}

debugRedis();
