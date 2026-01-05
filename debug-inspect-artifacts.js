const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

async function inspectArtifacts() {
    const redis = new Redis(process.env.REDIS_URL);
    const KEY = 'user:demo-user:storage:resistance_artifacts';

    console.log(`\n🔍 Inspecting Key: ${KEY}\n`);

    try {
        const raw = await redis.get(KEY);
        if (!raw) {
            console.log("❌ Key not found!");
            return;
        }

        const artifacts = JSON.parse(raw);
        console.log(`✅ Found ${artifacts.length} artifacts.\n`);

        artifacts.forEach((a, i) => {
            console.log(`[Artifact ${i}] ID: ${a.id}`);
            console.log(`  Title: "${a.title}"`);
            console.log(`  Values in 'text' field: ${a.text ? a.text.length + ' chars' : 'UNDEFINED/NULL'}`);
            if (!a.text) {
                console.log("  🛑 CRITICAL: 'text' field is missing or empty!");
            }
            // console.log(JSON.stringify(a, null, 2)); // Uncomment for full dump
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        redis.disconnect();
    }
}
inspectArtifacts();
