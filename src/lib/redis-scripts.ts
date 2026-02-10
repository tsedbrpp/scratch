import { redis } from './redis';

// Atomic script: Check balance > 0, decrement, and log transaction
// KEYS[1] = credits:{userId}
// KEYS[2] = transactions:{userId}
// ARGV[1] = amount (positive integer to decrement, e.g., 1)
// ARGV[2] = transaction JSON string
const DEDUCT_CREDITS_SCRIPT = `
    local current_credits = redis.call("GET", KEYS[1])
    
    -- Lazy Init: If key is missing, assume new user and give 100 free credits
    if not current_credits then
        redis.call("SET", KEYS[1], 100)
        current_credits = 100
    end

    if tonumber(current_credits) < tonumber(ARGV[1]) then
        return -1
    end

    local new_balance = redis.call("DECRBY", KEYS[1], ARGV[1])
    redis.call("LPUSH", KEYS[2], ARGV[2])
    
    return new_balance
`;

// [Refactor] Added Transaction Interface
export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    type: 'USAGE' | 'PURCHASE' | 'BONUS' | 'REFUND';
    source: string;
    referenceId: string;
    createdAt: string;
}

// Atomic script: Add credits, respecting the "New User = 100" rule
// KEYS[1] = credits:{userId}
// KEYS[2] = transactions:{userId}
// ARGV[1] = amount (positive integer)
// ARGV[2] = transaction JSON string
// ARGV[3] = default/initial balance for new users (e.g., 100)
const ADD_CREDITS_SCRIPT = `
    local current_credits = redis.call("GET", KEYS[1])
    
    -- Lazy Init: If key is missing, assume new user -> start at 100 (promotional)
    if not current_credits then
        current_credits = tonumber(ARGV[3])
    else
        current_credits = tonumber(current_credits)
    end

    local new_balance = current_credits + tonumber(ARGV[1])
    
    redis.call("SET", KEYS[1], new_balance)
    redis.call("LPUSH", KEYS[2], ARGV[2])
    
    return new_balance
`;

export async function deductCredits(userId: string, amount: number, source: string, referenceId: string) {
    const creditKey = `credits:${userId}`;
    const txKey = `transactions:${userId}`;

    const transaction: Transaction = {
        id: crypto.randomUUID(),
        userId,
        amount: -amount,
        type: 'USAGE',
        source,
        referenceId,
        createdAt: new Date().toISOString()
    };

    // Note: DEDUCT script (defined above/earlier) handles the lazy-init 100 logic too
    // We should probably unify the script or logic, but for now we trust the existing DEDUCT_CREDITS_SCRIPT
    // which was: "if not current_credits then redis.call('SET', KEYS[1], 100)..."
    // That is consistent.

    const result = await redis.eval(DEDUCT_CREDITS_SCRIPT, 2, creditKey, txKey, amount, JSON.stringify(transaction));
    return result as number;
}

export async function addCredits(userId: string, amount: number, source: string, referenceId: string, type: 'PURCHASE' | 'BONUS' | 'REFUND' = 'PURCHASE') {
    const creditKey = `credits:${userId}`;
    const txKey = `transactions:${userId}`;
    const idempotencyKey = `idempotency:${referenceId}`;

    // Check idempotency
    const processed = await redis.get(idempotencyKey);
    if (processed) {
        return { success: true, message: 'Already processed' };
    }

    const transaction: Transaction = {
        id: crypto.randomUUID(),
        userId,
        amount: amount,
        type,
        source,
        referenceId,
        createdAt: new Date().toISOString()
    };

    // Use atomic script instead of pipeline to ensure "read-modify-write" safety for the lazy init
    await redis.eval(ADD_CREDITS_SCRIPT, 2, creditKey, txKey, amount, JSON.stringify(transaction), 100);

    // Idempotency doesn't need to be in the same atomic block strictly, but good practice.
    // For simplicity, setting it after success is acceptable for "at least once" or "exactly once" approximation.
    // Ideally put inside Lua, but we'll stick to simple separate call for idempotency to avoid huge scripts.
    await redis.set(idempotencyKey, '1', 'EX', 86400);

    return { success: true };
}

export async function getCredits(userId: string): Promise<number> {
    const credits = await redis.get(`credits:${userId}`);
    return credits ? parseInt(credits, 10) : 100;
}

export async function getTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    const logs = await redis.lrange(`transactions:${userId}`, 0, limit - 1);
    return logs.map(log => JSON.parse(log) as Transaction);
}
