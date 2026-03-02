const Redis = require('ioredis');

const sourceUserId = 'user_3AGYapfYb074sI6PJoTsbkhaYUA'; // Admin user ID
const targetUserId = process.argv[2];

if (!targetUserId || !targetUserId.startsWith('user_')) {
    console.error("Usage: node sync_test_user.js <YOUR_TEST_USER_ID>");
    console.error("Please provide your Clerk Test User ID. You can find it in the Clerk Dashboard under 'Users'.");
    process.exit(1);
}

const redisUrl = 'redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524';

async function copyDataManual() {
    const redis = new Redis(redisUrl);

    // 1. Scan for all source keys
    let cursor = '0';
    let keysFound = [];
    do {
        const result = await redis.scan(cursor, 'MATCH', `*${sourceUserId}*`, 'COUNT', 1000);
        cursor = result[0];
        keysFound.push(...result[1]);
    } while (cursor !== '0');

    console.log(`Found ${keysFound.length} Admin items to duplicate to test user ${targetUserId}...`);

    let copiedCount = 0;

    // 2. Loop through and copy each one by exact type
    for (const sourceKey of keysFound) {
        const targetKey = sourceKey.replace(sourceUserId, targetUserId);
        const type = await redis.type(sourceKey);

        try {
            // Always delete the target key first to prevent merging sets/hashes
            await redis.del(targetKey);

            if (type === 'string') {
                const val = await redis.get(sourceKey);
                if (val !== null) await redis.set(targetKey, val);
            } else if (type === 'hash') {
                const val = await redis.hgetall(sourceKey);
                if (Object.keys(val).length > 0) await redis.hset(targetKey, val);
            } else if (type === 'set') {
                const val = await redis.smembers(sourceKey);
                if (val.length > 0) await redis.sadd(targetKey, ...val);
            } else if (type === 'list') {
                const val = await redis.lrange(sourceKey, 0, -1);
                if (val.length > 0) await redis.rpush(targetKey, ...val);
            } else if (type === 'zset') {
                const val = await redis.zrange(sourceKey, 0, -1, 'WITHSCORES');
                const args = [];
                for (let i = 0; i < val.length; i += 2) args.push(val[i + 1], val[i]);
                if (args.length > 0) await redis.zadd(targetKey, ...args);
            } else {
                continue;
            }

            // Re-apply TTL if necessary
            const ttl = await redis.ttl(sourceKey);
            if (ttl > 0) {
                await redis.expire(targetKey, ttl);
            }

            copiedCount++;
            if (copiedCount % 50 === 0) {
                console.log(`Copied ${copiedCount} items so far...`);
            }
        } catch (e) {
            console.error(`Failed to copy ${sourceKey} of type ${type}:`, e.message);
        }
    }

    console.log(`\nSuccessfully duplicated ${copiedCount} records to ${targetUserId}!`);
    console.log(`You should now see all your data when logged in on localhost.`);
    process.exit(0);
}

copyDataManual().catch(err => {
    console.error(err);
    process.exit(1);
});
