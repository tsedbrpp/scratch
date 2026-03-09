import { redis } from './redis';

// ==========================================
// V2 CREDIT BATCH BALANCE SYSTEM
// ==========================================

export interface CreditBatch {
    amount: number;
    expiresAt: number | null;
    createdAt: number;
    source: 'PURCHASE' | 'BONUS' | 'INTRO' | 'REFUND' | 'ADMIN' | 'SYSTEM';
    eventId?: string; // Idempotency key
}

export interface CreditStateV2 {
    version: 2;
    batches: CreditBatch[];
}

// ------------------------------------------
// LUA SCRIPTS
// ------------------------------------------

// Atomic script: Get existing V2 balance or sum up total active.
// KEYS[1] = credits_v2:{userId}
// KEYS[2] = legacy credits:{userId} (for migration)
// ARGV[1] = nowMs
// Returns: Total active balance
const GET_CREDITS_V2_SCRIPT = `
    local v2_state_raw = redis.call("GET", KEYS[1])
    local nowMs = tonumber(ARGV[1])
    local total = 0

    if v2_state_raw then
        local state = cjson.decode(v2_state_raw)
        for _, batch in ipairs(state.batches) do
            if batch.expiresAt == nil or batch.expiresAt == cjson.null or tonumber(batch.expiresAt) > nowMs then
                total = total + tonumber(batch.amount)
            end
        end
        return total
    end

    -- Fallback to legacy
    local legacy_raw = redis.call("GET", KEYS[2])
    if legacy_raw then
        return tonumber(legacy_raw)
    end

    -- Default for new users
    return 50
`;

// Atomic script: Add credits to V2 state.
// KEYS[1] = credits_v2:{userId}
// KEYS[2] = legacy credits:{userId}
// KEYS[3] = transactions:{userId}
// ARGV[1] = new batch JSON object
// ARGV[2] = nowMs
// ARGV[3] = eventId (for idempotency)
// ARGV[4] = transaction log JSON object
// Returns: New total active balance
const ADD_CREDITS_V2_SCRIPT = `
    local key_v2 = KEYS[1]
    local key_legacy = KEYS[2]
    local key_tx = KEYS[3]
    local new_batch = cjson.decode(ARGV[1])
    local nowMs = tonumber(ARGV[2])
    local target_event_id = ARGV[3]
    local tx_log = ARGV[4]

    local state
    local v2_state_raw = redis.call("GET", key_v2)

    if v2_state_raw then
        state = cjson.decode(v2_state_raw)
        
        -- Idempotency check
        if target_event_id and target_event_id ~= "" then
             for _, batch in ipairs(state.batches) do
                 if batch.eventId == target_event_id then
                      -- Already processed
                      -- Just return current total
                      local total = 0
                      for _, b in ipairs(state.batches) do
                         if b.expiresAt == nil or b.expiresAt == cjson.null or tonumber(b.expiresAt) > nowMs then
                              total = total + tonumber(b.amount)
                         end
                      end
                      return total
                 end
             end
        end
    else
        -- Migrate legacy
        state = { version = 2, batches = {} }
        local legacy_raw = redis.call("GET", key_legacy)
        local initialAmount = 50
        if legacy_raw then
            initialAmount = tonumber(legacy_raw)
        end
        
        if initialAmount > 0 then
            table.insert(state.batches, {
                amount = initialAmount,
                expiresAt = cjson.null,
                createdAt = nowMs,
                source = "INTRO"
            })
        end
    end

    -- Append new batch
    table.insert(state.batches, new_batch)
    
    -- Cleanup expired & 0 amount
    local valid_batches = {}
    local new_total = 0
    for _, batch in ipairs(state.batches) do
        local amt = tonumber(batch.amount)
        if amt > 0 then
            if batch.expiresAt == nil or batch.expiresAt == cjson.null or tonumber(batch.expiresAt) > nowMs then
                 table.insert(valid_batches, batch)
                 new_total = new_total + amt
            end
        end
    end
    state.batches = valid_batches

    redis.call("SET", key_v2, cjson.encode(state))
    redis.call("LPUSH", key_tx, tx_log)
    
    return new_total
`;

// Atomic script: Deduct credits.
// KEYS[1] = credits_v2:{userId}
// KEYS[2] = legacy credits:{userId}
// KEYS[3] = transactions:{userId}
// ARGV[1] = amount to deduct
// ARGV[2] = nowMs
// ARGV[3] = transaction log JSON object
// Returns: Remaining balance after deduction, or -1 if insufficient
const DEDUCT_CREDITS_V2_SCRIPT = `
    local key_v2 = KEYS[1]
    local key_legacy = KEYS[2]
    local key_tx = KEYS[3]
    local deduct_amount = tonumber(ARGV[1])
    local nowMs = tonumber(ARGV[2])
    local tx_log = ARGV[3]

    if deduct_amount <= 0 then return -1 end

    local state
    local v2_state_raw = redis.call("GET", key_v2)

    if v2_state_raw then
        state = cjson.decode(v2_state_raw)
    else
        -- Migrate legacy
        state = { version = 2, batches = {} }
        local legacy_raw = redis.call("GET", key_legacy)
        local initialAmount = 50
        if legacy_raw then
            initialAmount = tonumber(legacy_raw)
        end
        if initialAmount > 0 then
            table.insert(state.batches, {
                amount = initialAmount,
                expiresAt = cjson.null,
                createdAt = nowMs,
                source = "INTRO"
            })
        end
    end

    -- 1. Filter out expired and 0
    local valid_batches = {}
    local total_available = 0
    for _, batch in ipairs(state.batches) do
        local amt = tonumber(batch.amount)
        if amt > 0 then
             if batch.expiresAt == nil or batch.expiresAt == cjson.null or tonumber(batch.expiresAt) > nowMs then
                  table.insert(valid_batches, batch)
                  total_available = total_available + amt
             end
        end
    end

    if total_available < deduct_amount then
        return -1
    end

    -- 2. Sort batches: Soonest expiration first, permanent last, tie-break by createdAt
    table.sort(valid_batches, function(a, b)
        local aExp = a.expiresAt
        if aExp == cjson.null then aExp = nil else aExp = tonumber(aExp) end
        
        local bExp = b.expiresAt
        if bExp == cjson.null then bExp = nil else bExp = tonumber(bExp) end

        if aExp and not bExp then return true end
        if bExp and not aExp then return false end
        
        if aExp and bExp and aExp ~= bExp then
            return aExp < bExp
        end

        return tonumber(a.createdAt) < tonumber(b.createdAt)
    end)

    -- 3. Deduct
    local remaining = deduct_amount
    local final_batches = {}
    
    for i, batch in ipairs(valid_batches) do
        local amt = tonumber(batch.amount)
        if amt > 0 then
            if remaining > 0 then
                if amt <= remaining then
                    remaining = remaining - amt
                    batch.amount = 0
                else
                    batch.amount = amt - remaining
                    remaining = 0
                    table.insert(final_batches, batch)
                end
            else
                table.insert(final_batches, batch)
            end
        end
    end

    state.batches = final_batches
    redis.call("SET", key_v2, cjson.encode(state))
    redis.call("LPUSH", key_tx, tx_log)

    return total_available - deduct_amount
`;

// ------------------------------------------
// TYPESCRIPT INTERFACES & WRAPPERS
// ------------------------------------------

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    type: 'USAGE' | 'PURCHASE' | 'BONUS' | 'REFUND';
    source: string;
    referenceId: string;
    createdAt: string;
}

export async function deductCredits(userId: string, amount: number, source: string, referenceId: string) {
    const keyV2 = `credits_v2:${userId}`;
    const keyLegacy = `credits:${userId}`;
    const txKey = `transactions:${userId}`;
    const nowMs = Date.now();

    const transaction: Transaction = {
        id: crypto.randomUUID(),
        userId,
        amount: -amount,
        type: 'USAGE',
        source,
        referenceId,
        createdAt: new Date().toISOString()
    };

    const result = await redis.eval(
        DEDUCT_CREDITS_V2_SCRIPT,
        3,
        keyV2,
        keyLegacy,
        txKey,
        amount,
        nowMs,
        JSON.stringify(transaction)
    );
    return result as number;
}

export async function addCredits(userId: string, amount: number, source: 'PURCHASE' | 'BONUS' | 'REFUND' | 'ADMIN' | 'SYSTEM' = 'PURCHASE', referenceId: string, type: 'PURCHASE' | 'BONUS' | 'REFUND' = 'PURCHASE', expiresInMs?: number) {
    const keyV2 = `credits_v2:${userId}`;
    const keyLegacy = `credits:${userId}`;
    const txKey = `transactions:${userId}`;
    const nowMs = Date.now();

    const newBatch: CreditBatch = {
        amount,
        createdAt: nowMs,
        source: source as CreditBatch['source'],
        expiresAt: expiresInMs ? nowMs + expiresInMs : null,
        eventId: referenceId // Use referenceId as idempotency key
    };

    const transaction: Transaction = {
        id: crypto.randomUUID(),
        userId,
        amount,
        type,
        source,
        referenceId,
        createdAt: new Date().toISOString()
    };

    const newBalance = await redis.eval(
        ADD_CREDITS_V2_SCRIPT,
        3,
        keyV2,
        keyLegacy,
        txKey,
        JSON.stringify(newBatch),
        nowMs,
        referenceId,
        JSON.stringify(transaction)
    );

    return { success: true, newBalance };
}

export async function getCredits(userId: string): Promise<number> {
    const keyV2 = `credits_v2:${userId}`;
    const keyLegacy = `credits:${userId}`;
    const nowMs = Date.now();

    const total = await redis.eval(GET_CREDITS_V2_SCRIPT, 2, keyV2, keyLegacy, nowMs);
    return Number(total);
}

export async function getTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    const logs = await redis.lrange(`transactions:${userId}`, 0, limit - 1);
    return logs.map(log => JSON.parse(log) as Transaction);
}

