require('dotenv').config({ path: '.env.local' });
const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

async function retrieveAllBackups() {
    console.log(`Connecting to Redis at ${redisUrl}...`);

    try {
        // Find all keys matching the backup pattern
        // Note: For production with millions of keys, use SCAN. 
        // For this research study, KEYS is acceptable and simpler.
        const keys = await redis.keys('research:backup:*');

        console.log(`Found ${keys.length} backup records.`);

        if (keys.length === 0) {
            console.log("No records found.");
            process.exit(0);
        }

        const backups = [];

        // Fetch all data
        for (const key of keys) {
            const data = await redis.get(key);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    backups.push(parsed);
                } catch (e) {
                    console.error(`Failed to parse data for key ${key}`);
                }
            }
        }

        // Sort by submission timestamp (if available) or evaluator code
        backups.sort((a, b) => {
            const timeA = a.responses ? Math.max(...Object.values(a.responses).map(r => r.submittedAt || 0)) : 0;
            const timeB = b.responses ? Math.max(...Object.values(b.responses).map(r => r.submittedAt || 0)) : 0;
            return timeB - timeA; // Newest first
        });

        const filename = `FULL_STUDY_EXPORT_${Date.now()}.json`;
        const outputPath = path.join(process.cwd(), filename);

        // Create a summary structure
        const exportData = {
            exportTimestamp: new Date().toISOString(),
            totalRecords: backups.length,
            records: backups
        };

        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

        console.log(`\nSUCCESS! Exported ${backups.length} records.`);
        console.log(`File saved to: ${filename}`);

        // Print brief table
        console.log('\nSummary:');
        console.log('------------------------------------------------');
        console.log(String('Evaluator Code').padEnd(20) + String('Cases').padEnd(10) + 'Status');
        console.log('------------------------------------------------');
        backups.forEach(b => {
            const caseCount = b.responses ? Object.keys(b.responses).length : 0;
            const status = b.isComplete ? 'COMPLETE' : 'IN PROG';
            console.log(String(b.evaluatorCode).padEnd(20) + String(caseCount).padEnd(10) + status);
        });
        console.log('------------------------------------------------');

    } catch (err) {
        console.error("Error retrieving data:", err);
    } finally {
        redis.disconnect();
    }
}

retrieveAllBackups();
