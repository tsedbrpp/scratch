"use server";

import { redis } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { addCredits } from '@/lib/credits';

const REFERRAL_REWARD = 5;

interface ReferralState {
    success?: boolean;
    error?: string;
    code?: string;
    message?: string;
}

/**
 * Generates a unique referral code for the current user if one doesn't exist.
 */
export async function getOrGenerateReferralCode(): Promise<string> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const userCodeKey = `referral:user:${userId}:code`;
    const existingCode = await redis.get(userCodeKey);

    if (existingCode) return existingCode;

    // Generate a new short code (e.g. TEA-XC92)
    // We try until we find a unique one (unlikely to collide but good practice)
    let code = `TEA-${nanoid(4).toUpperCase()}`;
    let isUnique = false;

    while (!isUnique) {
        const codeOwnerKey = `referral:code:${code}:owner`;
        const exists = await redis.exists(codeOwnerKey);
        if (!exists) {
            isUnique = true;
        } else {
            code = `TEA-${nanoid(4).toUpperCase()}`;
        }
    }

    // Store mappings
    const codeOwnerKey = `referral:code:${code}:owner`;

    // Multi-key transaction not strictly needed for creation if we accept race condition on code uniqueness (very rare with nanoid)
    // but cleaner to set both.
    await redis.set(userCodeKey, code);
    await redis.set(codeOwnerKey, userId);

    return code;
}

/**
 * Server Action to redeem a referral code.
 */
export async function redeemReferralCode(prevState: ReferralState, formData: FormData): Promise<ReferralState> {
    try {
        const { userId } = await auth();
        if (!userId) return { error: "You must be logged in to redeem a code." };

        const code = formData.get("code")?.toString().trim().toUpperCase();
        if (!code) return { error: "Please enter a valid code." };

        // 1. Validate Code Exists
        const codeOwnerKey = `referral:code:${code}:owner`;
        const ownerId = await redis.get(codeOwnerKey);

        if (!ownerId) {
            return { error: "Invalid referral code." };
        }

        // 2. Prevent Self-Referral
        if (ownerId === userId) {
            return { error: "You cannot redeem your own referral code." };
        }

        // 3. Check if User Already Redeemed ANY code
        const redeemedKey = `referral:user:${userId}:is_redeemed`;
        const hasRedeemed = await redis.get(redeemedKey);

        if (hasRedeemed) {
            return { error: "You have already redeemed a referral code." };
        }

        // 4. Transactional Update
        // We give credits to BOTH users.
        const ownerCreditKey = `credits:user:${ownerId}`;
        const userCreditKey = `credits:user:${userId}`;
        const usageKey = `referral:code:${code}:usage`;

        // Using a pipeline to ensure atomicity is harder across keys if using cluster, 
        // but for standard Redis this works. 
        // Note: ioredis 'multi' works well.

        await addCredits(ownerId, REFERRAL_REWARD);
        await addCredits(userId, REFERRAL_REWARD);

        // Mark as redeemed
        await redis.set(redeemedKey, "true");

        // Track usage
        await redis.incr(usageKey);

        return {
            success: true,
            message: `Success! You and the referrer both earned ${REFERRAL_REWARD} credits.`
        };

    } catch (error) {
        console.error("Referral Error:", error);
        return { error: "Something went wrong. Please try again." };
    }
}

/**
 * Get stats for the current user
 */
export async function getReferralStats() {
    const { userId } = await auth();
    if (!userId) return { code: null, count: 0, earned: 0 };

    const code = await getOrGenerateReferralCode();
    const usageKey = `referral:code:${code}:usage`;
    const countStr = await redis.get(usageKey);
    const count = countStr ? parseInt(countStr) : 0;

    return {
        code,
        count,
        earned: count * REFERRAL_REWARD
    };
}
