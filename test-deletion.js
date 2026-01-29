
const Redis = require('ioredis');

const redisUrl = 'redis://localhost:6379';
const redis = new Redis(redisUrl);

// Simulating StorageService
const userId = 'user_2pk5h4S5rX9JpL9yq7zG2w8tF3k'; // Hardcoded from prev context or use a test ID
const key = `user:${userId}:storage:sources_v2`;

async function testDeletion() {
    try {
        console.log("--- Testing Deletion Logic ---");

        const testId = 'test-deletion-source-' + Date.now();
        const testSource = {
            id: testId,
            title: 'Test Deletion Source',
            type: 'Text'
        };

        // 1. ADD
        console.log(`Adding source ${testId}...`);
        await redis.hset(key, { [testId]: JSON.stringify(testSource) });

        // Verify Add
        const existsAfterAdd = await redis.hexists(key, testId);
        console.log(`Exists after add: ${existsAfterAdd}`); // Should be 1

        // 2. DELETE (Simulate deleteHashField)
        console.log(`Deleting source ${testId}...`);
        const count = await redis.hdel(key, testId);
        console.log(`Delete count: ${count}`); // Should be 1

        // Verify Delete
        const existsAfterDel = await redis.hexists(key, testId);
        console.log(`Exists after delete: ${existsAfterDel}`); // Should be 0

        if (existsAfterDel === 0) {
            console.log("SUCCESS: Deletion works at Redis level.");
        } else {
            console.error("FAILURE: Source still exists!");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        redis.disconnect();
    }
}

testDeletion();
