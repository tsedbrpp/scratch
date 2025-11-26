const Redis = require('ioredis');

async function testRedis() {
    console.log('🔍 Testing Redis Connection...\n');

    // Default to localhost:6379 if REDIS_URL is not set
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    console.log(`📡 Connecting to: ${redisUrl}`);

    const redis = new Redis(redisUrl);

    try {
        // 1. Test Connection (Ping)
        console.log('   Pinging Redis...');
        const pingResult = await redis.ping();
        console.log(`✅ Ping response: ${pingResult}`);

        // 2. Test Write
        const testKey = 'test_key_' + Date.now();
        const testValue = 'Hello from Antigravity!';
        console.log(`\n📝 Writing test key: ${testKey}`);
        await redis.set(testKey, testValue);
        console.log('✅ Write successful');

        // 3. Test Read
        console.log(`\n📖 Reading test key: ${testKey}`);
        const value = await redis.get(testKey);

        if (value === testValue) {
            console.log(`✅ Read successful! Value: "${value}"`);
        } else {
            console.error(`❌ Read mismatch. Expected "${testValue}", got "${value}"`);
        }

        // 4. Clean up
        console.log('\n🧹 Cleaning up...');
        await redis.del(testKey);
        console.log('✅ Test key deleted');

    } catch (error) {
        console.error('\n❌ Redis Error:', error.message);
    } finally {
        redis.disconnect();
        console.log('\n👋 Disconnected');
    }
}

testRedis();
