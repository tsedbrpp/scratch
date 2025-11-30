
const { initializeCredits, checkCredits, getCredits, addCredits } = require('./src/lib/credits');
const { redis } = require('./src/lib/redis');

async function testCredits() {
    const testUserId = 'test_user_' + Date.now();
    console.log(`Testing with User ID: ${testUserId}`);

    // 1. Initialize
    console.log('--- Test 1: Initialization ---');
    const initialBalance = await initializeCredits(testUserId);
    console.log(`Initial Balance: ${initialBalance} (Expected: 100)`);
    if (initialBalance !== 100) throw new Error('Initialization failed');

    // 2. Check & Deduct
    console.log('\n--- Test 2: Deduction ---');
    const result = await checkCredits(testUserId, 10, true);
    console.log(`Deduction Success: ${result.success}`);
    console.log(`Remaining Balance: ${result.remaining} (Expected: 90)`);
    if (result.remaining !== 90) throw new Error('Deduction failed');

    // 3. Insufficient Funds
    console.log('\n--- Test 3: Insufficient Funds ---');
    // Try to deduct 100 (balance is 90)
    const failResult = await checkCredits(testUserId, 100, true);
    console.log(`Should Fail: ${!failResult.success}`);
    console.log(`Error Message: ${failResult.error}`);
    if (failResult.success) throw new Error('Insufficient funds check failed');

    // 4. Add Credits
    console.log('\n--- Test 4: Add Credits ---');
    const newBalance = await addCredits(testUserId, 50);
    console.log(`New Balance after adding 50: ${newBalance} (Expected: 140)`);
    if (newBalance !== 140) throw new Error('Adding credits failed');

    console.log('\n✅ All Credit Tests Passed');
    process.exit(0);
}

testCredits().catch(err => {
    console.error('❌ Test Failed:', err);
    process.exit(1);
});
