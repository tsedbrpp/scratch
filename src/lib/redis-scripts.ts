import { redis } from './redis';

// Atomic script: Check balance > 0, decrement, and log transaction
// KEYS[1] = credits:{userId}
// KEYS[2] = transactions:{userId}
// ARGV[1] = amount (positive integer to decrement, e.g., 1)
// ARGV[2] = transaction JSON string
const DEDUCT_CREDITS_SCRIPT = `
    local current_credits = redis.call("GET", KEYS[1])
    
    -- Lazy Init: If key is missing, assume new user and give 5 free credits
    if not current_credits then
        redis.call("SET", KEYS[1], 5)
        current_credits = 5
    end

    if tonumber(current_credits) < tonumber(ARGV[1]) then
        return -1
    end

    local new_balance = redis.call("DECRBY", KEYS[1], ARGV[1])
    redis.call("LPUSH", KEYS[2], ARGV[2])
    
    return new_balance
`;

export async function deductCredits(userId: string, amount: number, source: string, referenceId: string) {
    const creditKey = `credits:${userId}`;
    const txKey = `transactions:${userId}`;

    const transaction = JSON.stringify({
        id: crypto.randomUUID(),
        userId,
        amount: -amount,
        type: 'USAGE',
        source,
        referenceId,
        createdAt: new Date().toISOString()
    });

    const result = await redis.eval(DEDUCT_CREDITS_SCRIPT, 2, creditKey, txKey, amount, transaction);
    return result as number; // Returns new balance or -1 if insufficient
}

export async function addCredits(userId: string, amount: number, source: string, referenceId: string, type: 'PURCHASE' | 'BONUS' | 'REFUND' = 'PURCHASE') {
    const creditKey = `credits:${userId}`;
    const txKey = `transactions:${userId}`;
    const idempotencyKey = `idempotency:${referenceId}`;

    // Check idempotency
    const processed = await redis.get(idempotencyKey);
    if (processed) {
        console.log(`[Redis] Idempotency hit for ${referenceId}. Skipping credit addition.`);
        return { success: true, message: 'Already processed' };
    }

    const transaction = JSON.stringify({
        id: crypto.randomUUID(),
        userId,
        amount: amount, // Positive for addition
        type,
        source,
        referenceId,
        createdAt: new Date().toISOString()
    });

    // Standardize lazy-init logic: If key doesn't exist, we assume they had the virtual 5.
    // So we should set it to 5 + amount.
    // We can't easily do this atomic with just INCRBY if we want to respect the "virtual 5".
    // Let's use a small LUA script for addCredits too to be consistent and safe.

    const ADD_CREDITS_SCRIPT = `
        local current_credits = redis.call("GET", KEYS[1])
        if not current_credits then
            current_credits = 5
        end
        local new_balance = tonumber(current_credits) + tonumber(ARGV[1])
        redis.call("SET", KEYS[1], new_balance)
        redis.call("LPUSH", KEYS[2], ARGV[2])
        redis.call("SET", KEYS[3], "1", "EX", 86400)
        return new_balance
    `;

    try {
        await redis.eval(ADD_CREDITS_SCRIPT, 3, creditKey, txKey, idempotencyKey, amount, transaction);
        return { success: true };
    } catch (err: any) {
        console.error("Redis Add Credits Error", err);
        throw err;
    }
}

export async function getCredits(userId: string): Promise<number> {
    const credits = await redis.get(`credits:${userId}`);
    // Return 5 for new users (virtual balance until materialized by usage)
    return credits ? parseInt(credits, 10) : 5;
}

export async function getTransactions(userId: string, limit: number = 50): Promise<any[]> {
    const logs = await redis.lrange(`transactions:${userId}`, 0, limit - 1);
    return logs.map(log => JSON.parse(log));
}
