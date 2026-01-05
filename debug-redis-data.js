const Redis = require('ioredis');

async function checkData() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    console.log(`Connecting to ${redisUrl}`);
    const redis = new Redis(redisUrl);

    try {
        const keys = await redis.keys('*');
        console.log(`\nFound ${keys.length} keys in Redis:`);
        keys.forEach(k => console.log(` - ${k}`));

        // Check specific known keys
        const interestKeys = ['sources', 'resistance_artifacts', 'resistance_artifacts_data'];

        for (const key of interestKeys) {
            const type = await redis.type(key);
            console.log(`\nKey '${key}' is type: ${type}`);
            if (type === 'string') {
                const val = await redis.get(key);
                console.log(` - Length: ${val.length} chars`);
                console.log(` - Preview: ${val.substring(0, 50)}...`);
            } else if (type === 'list') {
                const len = await redis.llen(key);
                console.log(` - List Length: ${len}`);
            } else if (type === 'none') {
                console.log(` - Key does not exist.`);
            }
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        redis.disconnect();
    }
}

checkData();
