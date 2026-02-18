const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

const redis = new Redis(process.env.REDIS_URL);

async function clearSurveyData() {
    try {
        console.log('Connecting to Redis...');

        // Define patterns for survey data
        // Based on list_research_keys.js output: research:backup:*
        const patterns = [
            'research:backup:*'
        ];

        let totalDeleted = 0;

        for (const pattern of patterns) {
            const stream = redis.scanStream({
                match: pattern,
                count: 100
            });

            for await (const keys of stream) {
                if (keys.length) {
                    const pipeline = redis.pipeline();
                    keys.forEach((key) => {
                        pipeline.del(key);
                    });
                    await pipeline.exec();
                    totalDeleted += keys.length;
                    console.log(`Deleted ${keys.length} keys matching ${pattern}`);
                }
            }
        }

        console.log(`\nSuccessfully deleted ${totalDeleted} survey-related keys.`);

    } catch (error) {
        console.error('Error clearing survey data:', error);
    } finally {
        redis.disconnect();
    }
}

clearSurveyData();
