const Redis = require('ioredis');
const redisUrl = 'redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524';

async function findUsers() {
    const redis = new Redis(redisUrl);
    let cursor = '0';
    let keysFound = new Set();
    do {
        const result = await redis.scan(cursor, 'MATCH', `*user_*`, 'COUNT', 5000);
        cursor = result[0];
        result[1].forEach(k => {
            const match = k.match(/user_[a-zA-Z0-9]+/);
            if (match) keysFound.add(match[0]);
        });
    } while (cursor !== '0');

    console.log("Users found in Redis:");
    console.log(Array.from(keysFound).join('\n'));
    process.exit(0);
}
findUsers().catch(console.error);
