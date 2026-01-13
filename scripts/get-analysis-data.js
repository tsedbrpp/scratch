const { createClient } = require('ioredis');
const fs = require('fs');

async function getAnalysisData() {
    const redis = createClient(process.env.REDIS_URL);

    try {
        console.log('Connecting to Redis...');

        // Get sources directly
        const sourcesJson = await redis.get('sources');

        if (!sourcesJson) {
            console.log('No "sources" key found in Redis.');
            return;
        }

        const sourcesData = JSON.parse(sourcesJson);
        console.log(`\nFound ${sourcesData.length} sources.`);

        // Write full dump to file
        fs.writeFileSync('analysis_dump.json', JSON.stringify(sourcesData, null, 2));
        console.log('Full analysis data written to analysis_dump.json');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await redis.quit();
    }
}

getAnalysisData();
