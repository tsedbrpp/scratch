const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');

// Load env to get remote URL
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const remoteUrl = process.env.REDIS_URL;

async function fixKeys() {
    console.log("Renaming Keys on Remote Redis...");

    if (!remoteUrl) {
        console.error("REDIS_URL not found");
        return;
    }

    const redis = new Redis(remoteUrl);
    const userId = 'demo-user'; // The ID we are forcing in the API

    try {
        // Fix 'sources'
        const oldKey = 'sources';
        const newKey = `user:${userId}:storage:sources`;

        const exists = await redis.exists(oldKey);
        if (exists) {
            console.log(`Renaming ${oldKey} -> ${newKey}`);
            // Check if new key exists first to avoid overwrite data loss (optional, here we want to overwrite)
            await redis.rename(oldKey, newKey);
            console.log("✅ Renamed sources.");
        } else {
            console.log(`ℹ Key '${oldKey}' not found (maybe already renamed?)`);
        }

        // Fix 'resistance_artifacts' if needed? 
        // Logic for resistance might be different, let's check resistance/artifacts/route.ts if needed.
        // Assuming persistence service uses same logic.

    } catch (e) {
        console.error("Error:", e);
    } finally {
        redis.disconnect();
    }
}

fixKeys();
