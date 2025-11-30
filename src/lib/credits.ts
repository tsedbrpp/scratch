import { redis } from '@/lib/redis';

const DEFAULT_STARTING_CREDITS = 100;

export interface CreditStatus {
    success: boolean;
    remaining: number;
    error?: string;
}

/**
 * Initializes a user's credit balance if it doesn't exist.
 * @param userId - The user ID.
 * @returns The current credit balance.
 */
export async function initializeCredits(userId: string): Promise<number> {
    const key = `credits:user:${userId}`;
    const exists = await redis.exists(key);

    if (!exists) {
        await redis.set(key, DEFAULT_STARTING_CREDITS);
        return DEFAULT_STARTING_CREDITS;
    }

    const balance = await redis.get(key);
    return balance ? parseInt(balance, 10) : 0;
}

/**
 * Checks if a user has enough credits and optionally deducts them.
 * @param userId - The user ID.
 * @param cost - The number of credits to deduct (default: 1).
 * @param deduct - Whether to actually deduct the credits (default: true).
 * @returns Promise<CreditStatus>
 */
export async function checkCredits(userId: string, cost: number = 1, deduct: boolean = true): Promise<CreditStatus> {
    const key = `credits:user:${userId}`;

    // Ensure user exists
    let balanceStr = await redis.get(key);

    if (balanceStr === null) {
        // Auto-initialize new users
        await redis.set(key, DEFAULT_STARTING_CREDITS);
        balanceStr = DEFAULT_STARTING_CREDITS.toString();
    }

    const balance = parseInt(balanceStr, 10);

    if (balance < cost) {
        return {
            success: false,
            remaining: balance,
            error: 'Insufficient credits'
        };
    }

    if (deduct) {
        const newBalance = await redis.decrby(key, cost);
        return {
            success: true,
            remaining: newBalance
        };
    }

    return {
        success: true,
        remaining: balance
    };
}

/**
 * Gets the current credit balance for a user.
 */
export async function getCredits(userId: string): Promise<number> {
    const key = `credits:user:${userId}`;
    const balance = await redis.get(key);

    if (balance === null) {
        return DEFAULT_STARTING_CREDITS; // Virtual default for display
    }

    return parseInt(balance, 10);
}

/**
 * Adds credits to a user's balance (e.g., after payment).
 */
export async function addCredits(userId: string, amount: number): Promise<number> {
    const key = `credits:user:${userId}`;
    const newBalance = await redis.incrby(key, amount);
    return newBalance;
}
