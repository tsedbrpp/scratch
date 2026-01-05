const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

async function smartSync() {
    const redis = new Redis(process.env.REDIS_URL);
    const REAL_KEY = 'user:user_364D6LEBTCeN6mgbSfR8h3TrMdp:storage:sources';
    const DEMO_KEY = 'user:demo-user:storage:sources';

    try {
        const realData = await redis.get(REAL_KEY);
        const demoData = await redis.get(DEMO_KEY);

        console.log(`Real Data Size: ${realData ? realData.length : 0}`);
        console.log(`Demo Data Size: ${demoData ? demoData.length : 0}`);

        if (realData) {
            console.log("Backing up Demo Data...");
            if (demoData) await redis.set(`${DEMO_KEY}:backup`, demoData);

            console.log("Overwriting Demo Data with Real Data (Vercel State)...");
            await redis.set(DEMO_KEY, realData);
            console.log("✅ Sync Complete: Localhost (Demo) now matches Vercel.");
        } else {
            console.log("⚠ Real user has no data. Nothing to sync from Vercel.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        redis.disconnect();
    }
}
smartSync();
