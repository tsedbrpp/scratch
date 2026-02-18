const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

const redis = new Redis(process.env.REDIS_URL);

async function listKeys() {
    try {
        console.log('Connecting to Redis...');
        const stream = redis.scanStream({
            match: 'research:*',
            count: 100
        });

        let foundAny = false;
        for await (const keys of stream) {
            if (keys.length) {
                foundAny = true;
                console.log('Found keys:', keys);
            }
        }

        if (!foundAny) {
            console.log('No keys found matching research:*');
        }

    } catch (error) {
        console.error('Error listing keys:', error);
    } finally {
        redis.disconnect();
    }
}

listKeys();
