const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

async function clearBrokenArtifacts() {
    const redis = new Redis(process.env.REDIS_URL);
    const KEY = 'user:demo-user:storage:resistance_artifacts';

    console.log(`\n🧹 Clearing Broken Artifacts from: ${KEY}\n`);

    try {
        await redis.del(KEY);
        console.log("✅ Key deleted. The list should now be empty.");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        redis.disconnect();
    }
}
clearBrokenArtifacts();
