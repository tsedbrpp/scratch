const Redis = require('ioredis');

// URL provided by user
const remoteUrl = "redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524";

async function checkRemoteData() {
    console.log(`📡 Connecting to Remote Redis: ${remoteUrl.split('@')[1]}...`); // Log only host for privacy in logs
    const redis = new Redis(remoteUrl);

    try {
        await redis.ping();
        console.log("✅ Connection successful!");

        const keys = await redis.keys('*');
        console.log(`\nFound ${keys.length} keys in Remote Redis:`);
        keys.forEach(k => console.log(` - ${k}`));

        const interestKeys = ['sources', 'resistance_artifacts'];

        for (const key of interestKeys) {
            const type = await redis.type(key);
            console.log(`\nKey '${key}' is type: ${type}`);
            if (type === 'string') {
                const val = await redis.get(key);
                console.log(` - Length: ${val.length} chars`);
            } else if (type === 'none') {
                console.log(` - Key does not exist.`);
            }
        }

    } catch (e) {
        console.error("❌ Connection failed:", e.message);
    } finally {
        redis.disconnect();
    }
}

checkRemoteData();
