import { redis } from '@/lib/redis';
import {
    getCredits,
    addCredits,
    deductCredits,
    getTransactions
} from './redis-scripts';
import { checkCredits } from './credits';

// Polyfill for crypto.randomUUID in Node test environments if needed
if (!global.crypto) {
    global.crypto = require('crypto');
}

describe('Credit Batch Balance System V2', () => {
    const TEST_USER = 'test_user_v2_ledger';
    const KEY_V2 = `credits_v2:${TEST_USER}`;
    const KEY_LEGACY = `credits:${TEST_USER}`;
    const KEY_TX = `transactions:${TEST_USER}`;

    beforeEach(async () => {
        // Clear state before each test
        await redis.del(KEY_V2, KEY_LEGACY, KEY_TX);
    });

    afterAll(async () => {
        // Cleanup after all
        await redis.del(KEY_V2, KEY_LEGACY, KEY_TX);
    });

    describe('1. Migration & Initialization', () => {
        it('should initialize a brand new user with 50 INTRO credits', async () => {
            const balance = await getCredits(TEST_USER);
            expect(balance).toBe(50);

            // Verify the v2 state was NOT created by just a read. 
            // In our Lua script, GET does not mutate/migrate. It just returns 50 if nothing exists.
            const v2Raw = await redis.get(KEY_V2);
            expect(v2Raw).toBeNull();
        });

        it('should lazily migrate a legacy integer balance on first write', async () => {
            // Setup legacy state
            await redis.set(KEY_LEGACY, 100);

            // Read should return legacy sum
            const readBalance = await getCredits(TEST_USER);
            expect(readBalance).toBe(100);

            // Write should trigger migration
            const res = await addCredits(TEST_USER, 20, "PURCHASE", "test-evt-1");
            expect(res.newBalance).toBe(120);

            // Verify V2 structure
            const v2Raw = await redis.get(KEY_V2);
            expect(v2Raw).not.toBeNull();
            const state = JSON.parse(v2Raw as string);
            expect(state.version).toBe(2);
            expect(state.batches.length).toBe(2); // 1 migrated legacy, 1 new

            // Legacy batch should be INTRO, amount 100, permanent
            expect(state.batches[0].amount).toBe(100);
            expect(state.batches[0].source).toBe("INTRO");
            expect(state.batches[0].expiresAt).toBeNull();
        });
    });

    describe('2. Expiration Logic', () => {
        it('should not count expired batches in the active balance', async () => {
            // Add permanent credits
            await addCredits(TEST_USER, 50, "BONUS", "test-evt-perm");

            // Add expiring credits (expired 1 second ago)
            await addCredits(TEST_USER, 25, "PURCHASE", "test-evt-expir", "PURCHASE", -1000);

            // Total balance should only be the 50 permanent + 50 default intro = 100
            const balance = await getCredits(TEST_USER);
            expect(balance).toBe(100); // 50 intro + 50 bonus
        });
    });

    describe('3. Deduction Ordering (Soonest Expires First)', () => {
        it('should deduct from the batch expiring soonest first', async () => {
            // Default user has 50 permanent.
            // Add Batch A: Expires in 1 day
            await addCredits(TEST_USER, 10, "PURCHASE", "test-evt-A", "PURCHASE", 86400000);

            // Add Batch B: Expires in 5 days
            await addCredits(TEST_USER, 20, "PURCHASE", "test-evt-B", "PURCHASE", 5 * 86400000);

            // Total is 50 (intro) + 10 + 20 = 80
            expect(await getCredits(TEST_USER)).toBe(80);

            // Deduct 15. This should consume all 10 of Batch A, and 5 from Batch B.
            const remaining = await deductCredits(TEST_USER, 15, "TEST", "deduct-1");
            expect(remaining).toBe(65);

            // Verify internal state
            const v2Raw = await redis.get(KEY_V2);
            const state = JSON.parse(v2Raw as string);

            // Intro batch should be untouched (50)
            const intro = state.batches.find((b: any) => b.source === "INTRO");
            expect(intro.amount).toBe(50);

            // Batch A should be completely removed (compacted)
            const batchA = state.batches.find((b: any) => b.eventId === "test-evt-A");
            expect(batchA).toBeUndefined();

            // Batch B should have 15 remaining
            const batchB = state.batches.find((b: any) => b.eventId === "test-evt-B");
            expect(batchB.amount).toBe(15);
        });
    });

    describe('4. Insufficient Funds & Atomic Failure', () => {
        it('should return -1 and not mutate state if deducting more than available', async () => {
            // User starts with 50.
            const balance1 = await getCredits(TEST_USER);
            expect(balance1).toBe(50);

            // Deduct 100
            const result = await deductCredits(TEST_USER, 100, "TEST", "fail-deduct");

            // Should fail
            expect(result).toBe(-1);

            // Balance should still be 50
            const balance2 = await getCredits(TEST_USER);
            expect(balance2).toBe(50);
        });
    });

    describe('5. Idempotent Adds', () => {
        it('should ignore duplicate add requests with the same eventId', async () => {
            // First add
            const res1 = await addCredits(TEST_USER, 30, "PURCHASE", "stripe-evt-123");
            expect(res1.newBalance).toBe(80); // 50 intro + 30

            // Second add with exact same UUID
            const res2 = await addCredits(TEST_USER, 30, "PURCHASE", "stripe-evt-123");

            // Balance should remain 80
            expect(res2.newBalance).toBe(80);

            // Verify there is only one batch with that eventId
            const v2Raw = await redis.get(KEY_V2);
            const state = JSON.parse(v2Raw as string);
            const matchingBatches = state.batches.filter((b: any) => b.eventId === "stripe-evt-123");
            expect(matchingBatches.length).toBe(1);
        });
    });

    describe('6. Compaction / Pruning', () => {
        it('should automatically remove 0-amount batches during deduction', async () => {
            // 50 intro balance.
            // Deduct exactly 50
            const remaining = await deductCredits(TEST_USER, 50, "TEST", "drain-all");
            expect(remaining).toBe(0);

            // State length should be 0 because 0 amount batches are dropped
            const v2Raw = await redis.get(KEY_V2);
            const state = JSON.parse(v2Raw as string);
            expect(state.batches.length).toBe(0);
        });
    });
});
