import { getCredits as v2GetCredits, addCredits as v2AddCredits, deductCredits as v2DeductCredits } from '@/lib/redis-scripts';

const DEFAULT_STARTING_CREDITS = 50;

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
    // V2 GET script handles initialization automatically by injecting INTRO batch or legacy fallback
    return await v2GetCredits(userId);
}

/**
 * Checks if a user has enough credits and optionally deducts them.
 * @param userId - The user ID.
 * @param cost - The number of credits to deduct (default: 1).
 * @param deduct - Whether to actually deduct the credits (default: true).
 * @returns Promise<CreditStatus>
 */
export async function checkCredits(userId: string, cost: number = 1, deduct: boolean = true): Promise<CreditStatus> {
    // 1. Get current available balance securely
    const balance = await v2GetCredits(userId);

    if (balance < cost) {
        // Auto-refill for Development/Research Mode (preserve legacy logic here, but route via V2 ADD)
        const refillAmount = 10000;
        await v2AddCredits(userId, refillAmount, "SYSTEM", crypto.randomUUID(), "BONUS");

        // The auto-refill makes the balance valid
        if (deduct) {
            const remaining = await v2DeductCredits(userId, cost, "SYSTEM", crypto.randomUUID());
            return { success: remaining >= 0, remaining: remaining >= 0 ? remaining : balance + refillAmount };
        }

        return {
            success: true,
            remaining: balance + refillAmount
        };
    }

    if (deduct) {
        const remaining = await v2DeductCredits(userId, cost, "SYSTEM", crypto.randomUUID());
        return {
            success: remaining >= 0,
            remaining: remaining >= 0 ? remaining : balance
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
    return await v2GetCredits(userId);
}

/**
 * Adds credits to a user's balance (e.g., after payment).
 * Defaults to a 45-day expiration policy for purchased credits.
 */
export async function addCredits(userId: string, amount: number): Promise<number> {
    // 45 Days in milliseconds
    const EXPIRE_IN_MS = 45 * 24 * 60 * 60 * 1000;

    const res = await v2AddCredits(userId, amount, "PURCHASE", crypto.randomUUID(), "PURCHASE", EXPIRE_IN_MS);
    return res.newBalance as number;
}
