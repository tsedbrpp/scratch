const Redis = require('ioredis');

const sourceUserId = 'user_3AGYapfYb074sI6PJoTsbkhaYUA';
const targetUserId = 'user_demo_instanttea';
const redisUrl = 'redis://default:065Kh9HnAEPBld7mjXdEtBJbofiRWGXh@redis-13524.c60.us-west-1-2.ec2.cloud.redislabs.com:13524';

async function pipeData() {
    const redis = new Redis(redisUrl);

    // Scan for all source keys
    let cursor = '0';
    let keysFound = [];
    do {
        const result = await redis.scan(cursor, 'MATCH', `*${sourceUserId}*`, 'COUNT', 1000);
        cursor = result[0];
        keysFound.push(...result[1]);
    } while (cursor !== '0');

    console.log(`Piping ${keysFound.length} items to Demo user...`);

    // Send them in batches of 50 to avoid timing out the remote connection
    const BATCH_SIZE = 50;
    for (let i = 0; i < keysFound.length; i += BATCH_SIZE) {
        const batch = keysFound.slice(i, i + BATCH_SIZE);
        const pipeline = redis.pipeline();

        for (const sourceKey of batch) {
            const targetKey = sourceKey.replace(sourceUserId, targetUserId);
            pipeline.dump(sourceKey);
        }

        const dumps = await pipeline.exec();

        const restorePipeline = redis.pipeline();
        for (let j = 0; j < batch.length; j++) {
            const sourceKey = batch[j];
            const targetKey = sourceKey.replace(sourceUserId, targetUserId);
            const err = dumps[j][0];
            const dumpData = dumps[j][1];

            if (!err && dumpData) {
                restorePipeline.restore(targetKey, 0, dumpData, 'REPLACE');
            }
        }
        await restorePipeline.exec();
        console.log(`Processed batch ${i} to ${i + BATCH_SIZE}`);
    }

    console.log(`Complete!`);
    process.exit(0);
}

pipeData().catch(err => {
    console.error(err);
    process.exit(1);
});
