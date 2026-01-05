const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');

// Load env to get remote URL
const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

const remoteUrl = process.env.REDIS_URL;

async function auditKeys() {
    console.log("🔍 Auditing Remote Redis Keys...");

    if (!remoteUrl) {
        console.error("❌ REDIS_URL not found in .env.local");
        return;
    }

    const redis = new Redis(remoteUrl);

    try {
        const keys = await redis.keys('user:*');
        console.log(`\nFound ${keys.length} User Keys:`);

        // Group by user ID
        const users = new Set();
        keys.forEach(k => {
            // format: user:<id>:namespace:key
            const parts = k.split(':');
            if (parts.length > 2) {
                users.add(parts[1]);
            }
            console.log(` - ${k}`);
        });

        console.log(`\n👥 Identified Users (${users.size}):`);
        users.forEach(u => console.log(` - ${u}`));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        redis.disconnect();
    }
}

auditKeys();
