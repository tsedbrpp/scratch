const Redis = require('ioredis');

const oldUserId = 'user_3AGYapfYb074sI6PJoTsbkhaYno';
const newUserId = 'user_3AGYapfYb074sI6PJoTsbkhaYUA';
const redisUrl = 'redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524';

async function migrateAllData() {
    const redis = new Redis(redisUrl);
    let totalRenamed = 0;

    // We loop the entire scan process until the old user ID truly has 0 keys left
    while (true) {
        let cursor = '0';
        let keysFound = [];

        do {
            const result = await redis.scan(cursor, 'MATCH', `*${oldUserId}*`, 'COUNT', 1000);
            cursor = result[0];
            keysFound.push(...result[1]);
        } while (cursor !== '0');

        if (keysFound.length === 0) {
            console.log(`\nSuccess! 0 keys remaining on the typo ID.`);
            console.log(`Total records migrated across all passes: ${totalRenamed}`);
            break;
        }

        console.log(`Found ${keysFound.length} keys to migrate in this pass...`);
        let passRenamed = 0;

        for (const oldKey of keysFound) {
            const newKey = oldKey.replace(oldUserId, newUserId);
            try {
                // If the new key already exists, we delete it first to ensure the rename succeeds
                const exists = await redis.exists(newKey);
                if (exists) {
                    await redis.del(newKey);
                }
                await redis.rename(oldKey, newKey);
                passRenamed++;
            } catch (e) {
                console.error(`Error renaming ${oldKey}:`, e.message);
            }
        }

        totalRenamed += passRenamed;
        console.log(`Pass complete: Migrated ${passRenamed} records.`);
    }

    process.exit(0);
}

migrateAllData().catch(err => {
    console.error(err);
    process.exit(1);
});
