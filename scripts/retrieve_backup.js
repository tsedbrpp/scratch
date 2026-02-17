require('dotenv').config({ path: '.env.local' });
const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

async function retrieveBackup(code) {
    if (!code) {
        console.error("Please provide an Evaluator Code.");
        console.log("Usage: node scripts/retrieve_backup.js <CODE>");
        process.exit(1);
    }

    const key = `research:backup:${code}`;
    console.log(`Connecting to Redis at ${redisUrl}...`);
    console.log(`Fetching key: ${key}`);

    try {
        const data = await redis.get(key);
        if (!data) {
            console.error("No data found for this code.");
            process.exit(1);
        }

        const parsed = JSON.parse(data);
        const filename = `backup_${code}_${Date.now()}.json`;
        const outputPath = path.join(process.cwd(), filename);

        fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2));

        console.log(`\nSUCCESS! Data found.`);
        console.log(`- Evaluator: ${parsed.evaluatorCode}`);
        console.log(`- Cases Completed: ${parsed.responses ? Object.keys(parsed.responses).length : 0}`);
        console.log(`- Saved to file: ${filename}`);

    } catch (err) {
        console.error("Error retrieving data:", err);
    } finally {
        redis.disconnect();
    }
}

const code = process.argv[2];
retrieveBackup(code);
