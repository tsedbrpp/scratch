const Redis = require('ioredis');

const oldUserId = 'user_364D6LEBTCeN6mgbSfR8h3TrMdp';
const redisUrl = 'redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524';

async function checkOldData() {
    const redis = new Redis(redisUrl);

    // We will scan for keys that CONTAIN the old user ID
    let cursor = '0';
    let keysFound = [];

    do {
        const result = await redis.scan(cursor, 'MATCH', `*${oldUserId}*`, 'COUNT', 100);
        cursor = result[0];
        keysFound.push(...result[1]);
    } while (cursor !== '0');

    console.log(`Found ${keysFound.length} keys associated with the old Dev User ID.`);
    console.log('Sample keys:');
    console.log(keysFound.slice(0, 5));

    process.exit(0);
}

checkOldData().catch(err => {
    console.error(err);
    process.exit(1);
});
