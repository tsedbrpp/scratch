const Redis = require('ioredis');

const redisUrl = 'redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524';

async function listUsers() {
    const redis = new Redis(redisUrl);
    let cursor = '0';
    let users = new Set();
    let keyCount = 0;

    do {
        const result = await redis.scan(cursor, 'MATCH', '*user_*', 'COUNT', 1000);
        cursor = result[0];
        keyCount += result[1].length;
        for (const key of result[1]) {
            const match = key.match(/user_[a-zA-Z0-9]+/);
            if (match) {
                users.add(match[0]);
            }
        }
    } while (cursor !== '0');

    console.log(`Scanned ${keyCount} keys containing 'user_'.`);
    console.log('Unique User IDs currently in the database:');
    for (const user of users) {
        // Count how many keys belong to this user
        let userKeyCount = 0;
        let uCursor = '0';
        do {
            const res = await redis.scan(uCursor, 'MATCH', `*${user}*`, 'COUNT', 1000);
            uCursor = res[0];
            userKeyCount += res[1].length;
        } while (uCursor !== '0');
        console.log(`- ${user}: ${userKeyCount} keys`);
    }

    process.exit(0);
}

listUsers().catch(err => {
    console.error(err);
    process.exit(1);
});
