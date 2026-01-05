const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

const remoteUrl = process.env.REDIS_URL;

async function syncUsers() {
    console.log("🔄 Syncing Real Source Data to Demo User...");

    if (!remoteUrl) {
        console.error("REDIS_URL missing");
        return;
    }

    const redis = new Redis(remoteUrl);

    // Identified from audit
    const SOURCE_USER = 'user_364D6LEBTCeN6mgbSfR8h3TrMdp';
    const TARGET_USER = 'demo-user';

    try {
        const keysToSync = ['sources', 'resistance_artifacts']; // Add others if needed like 'analysis:...'

        for (const key of keysToSync) {
            const sourceKey = `user:${SOURCE_USER}:storage:${key}`;
            const targetKey = `user:${TARGET_USER}:storage:${key}`;

            console.log(`Checking ${sourceKey}...`);
            const exists = await redis.exists(sourceKey);

            if (exists) {
                const data = await redis.get(sourceKey);
                console.log(` - Found data (${data.length} chars). Overwriting Demo User...`);
                await redis.set(targetKey, data);
                console.log(` - ✅ Synced ${key}`);
            } else {
                console.log(` - ⚠ Source data not found for ${key}. Skipping.`);
                // If source doesn't have it, maybe 'sources' (legacy) has it?
                if (key === 'sources') {
                    const legacyKey = 'sources';
                    const legacyExists = await redis.exists(legacyKey);
                    if (legacyExists) {
                        console.log(` - Found legacy 'sources' key. Syncing that to demo user...`);
                        const legData = await redis.get(legacyKey);
                        await redis.set(targetKey, legData);
                        console.log(` - ✅ Synced from legacy sources`);
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        redis.disconnect();
    }
}

syncUsers();
