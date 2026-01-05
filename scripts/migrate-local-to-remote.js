const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');

// Load env to get remote URL
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.config({ path: envPath });

async function migrate() {
    console.log("🚀 Starting Data Migration: Local -> Remote");

    const localUrl = 'redis://localhost:6379';
    // Use the remote URL from env, or the one the user posted if env loading fails
    const remoteUrl = process.env.REDIS_URL || "redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524";

    if (!remoteUrl || remoteUrl.includes('localhost')) {
        console.error("❌ Valid Remote REDIS_URL not found.");
        return;
    }

    const localRedis = new Redis(localUrl);
    const remoteRedis = new Redis(remoteUrl);

    console.log("Connecting...");

    try {
        // Keys to migrate
        const keysToMigrate = ['sources', 'resistance_artifacts']; // Add others if needed

        for (const key of keysToMigrate) {
            console.log(`\nChecking key: ${key}`);

            // Get from Local
            const type = await localRedis.type(key);
            if (type === 'none') {
                console.log(` - Skiping (Does not exist on local)`);
                continue;
            }

            console.log(` - Reading from Local (${type})...`);
            let value;
            if (type === 'string') {
                value = await localRedis.get(key);
            } else {
                console.log(` - Skipping non-string type for now (implement if needed)`);
                continue;
            }

            // Check if Remote already has it
            const remoteType = await remoteRedis.type(key);
            if (remoteType !== 'none') {
                console.log(` - ⚠ Key exists on remote. Overwriting...`);
            }

            // Write to Remote
            console.log(` - Writing to Remote (${value.length} chars)...`);
            await remoteRedis.set(key, value);
            console.log(` - ✅ Success`);
        }

        console.log("\n🎉 Migration Complete!");

    } catch (e) {
        console.error("Migration Failed:", e);
    } finally {
        localRedis.disconnect();
        remoteRedis.disconnect();
    }
}

migrate();
