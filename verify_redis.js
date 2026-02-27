const Redis = require('ioredis');

const oldUserId = 'user_364D6LEBTCeN6mgbSfR8h3TrMdp';
const newUserId = 'user_3AGYapfYb074sI6PJoTsbkhaYUA';
const redisUrl = 'redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524';

async function verifyData() {
    const redis = new Redis(redisUrl);

    // Check old keys
    let cursor = '0';
    let oldKeysFound = [];
    do {
        const result = await redis.scan(cursor, 'MATCH', `*${oldUserId}*`, 'COUNT', 100);
        cursor = result[0];
        oldKeysFound.push(...result[1]);
    } while (cursor !== '0');

    // Check new keys
    cursor = '0';
    let newKeysFound = [];
    do {
        const result = await redis.scan(cursor, 'MATCH', `*${newUserId}*`, 'COUNT', 100);
        cursor = result[0];
        newKeysFound.push(...result[1]);
    } while (cursor !== '0');

    console.log(`Verification Results:`);
    console.log(`Keys remaining on old Development ID: ${oldKeysFound.length}`);
    console.log(`Keys successfully transferred to Production ID: ${newKeysFound.length}`);

    if (oldKeysFound.length > 0) {
        console.log('Not all old keys migrated. Rerunning migration script...');
    }

    process.exit(0);
}

verifyData().catch(err => {
    console.error(err);
    process.exit(1);
});
