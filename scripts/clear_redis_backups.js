const Redis = require('ioredis');
// URL from .env.local
const redis = new Redis('redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524');

async function clearBackups() {
    try {
        const stream = redis.scanStream({
            match: 'research:backup:*',
            count: 100
        });

        let totalDeleted = 0;

        stream.on('data', async (keys) => {
            if (keys.length) {
                const pipeline = redis.pipeline();
                keys.forEach(key => {
                    pipeline.del(key);
                });
                await pipeline.exec();
                totalDeleted += keys.length;
                console.log(`Deleted ${keys.length} keys...`);
            }
        });

        stream.on('end', () => {
            console.log(`\nOperation Complete. Total keys deleted: ${totalDeleted}`);
            redis.quit();
        });

        stream.on('error', (err) => {
            console.error('Scan error:', err);
            redis.quit();
        });

    } catch (error) {
        console.error('Error clearing backups:', error);
        redis.quit();
    }
}

clearBackups();
