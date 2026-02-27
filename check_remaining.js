const Redis = require('ioredis');

const oldUserId = 'user_3AGYapfYb074sI6PJoTsbkhaYUA';
const newUserId = 'user_3AGYapfYb074sI6PJoTsbkhaYno';
const redisUrl = 'redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524';

async function checkKeys() {
    const redis = new Redis(redisUrl);

    // Check old keys
    let cursor = '0';
    let keysFound = [];
    do {
        const result = await redis.scan(cursor, 'MATCH', `*${oldUserId}*`, 'COUNT', 1000);
        cursor = result[0];
        keysFound.push(...result[1]);
    } while (cursor !== '0');

    console.log(`Remaining old keys on YUA: ${keysFound.length}`);

    // Check new keys
    cursor = '0';
    let newKeysFound = [];
    do {
        const result = await redis.scan(cursor, 'MATCH', `*${newUserId}*`, 'COUNT', 1000);
        cursor = result[0];
        newKeysFound.push(...result[1]);
    } while (cursor !== '0');

    console.log(`Transferred keys on Yno: ${newKeysFound.length}`);

    process.exit(0);
}

checkKeys().catch(err => {
    console.error(err);
    process.exit(1);
});
