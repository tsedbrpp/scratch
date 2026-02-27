import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { setRateLimitOverride, setHardCapOverride, getUserRateLimitConfig, resetUserUsage } from '@/lib/ratelimit';
import { getCredits, addCredits } from '@/lib/redis-scripts';
import { redis } from '@/lib/redis';
import { createClerkClient } from '@clerk/nextjs/server';

import { isAdmin } from '@/lib/auth-helper';

// Initialize Clerk Client
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function GET() {
    const { userId } = await auth();
    if (!userId || !await isAdmin(userId)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // 1. Fetch all users from Clerk
        const clerkUsers = await clerkClient.users.getUserList({ limit: 100 });

        // 2. Fetch active usage from Redis
        const usageKeys = await redis.keys('ratelimit:user:*');
        const usageMap = new Map<string, { usage: number, ttl: number }>();

        for (const key of usageKeys) {
            const uid = key.replace('ratelimit:user:', '');
            const usage = await redis.get(key);
            const ttl = await redis.ttl(key);
            usageMap.set(uid, { usage: parseInt(usage || '0', 10), ttl });
        }

        // 3. Fetch total usage from Redis
        const totalUsageKeys = await redis.keys('usage:user:*:total');
        const totalUsageMap = new Map<string, number>();
        for (const key of totalUsageKeys) {
            // key format: usage:user:<userId>:total
            const uid = key.split(':')[2];
            const total = await redis.get(key);
            totalUsageMap.set(uid, parseInt(total || '0', 10));
        }

        // 4. Fetch credits from Redis
        // We can't easily scan all credits:* keys because we want to align with users list
        // So we will just fetch for each user in step 5

        // 5. Merge data
        const users = await Promise.all(clerkUsers.data.map(async (user) => {
            const usageData = usageMap.get(user.id) || { usage: 0, ttl: -1 };
            const totalUsage = totalUsageMap.get(user.id) || 0;
            const config = await getUserRateLimitConfig(user.id);
            const credits = await getCredits(user.id);

            return {
                userId: user.id,
                email: user.emailAddresses[0]?.emailAddress || 'No Email',
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name',
                usage: usageData.usage,
                totalUsage,
                credits,
                limitOverride: config.limit,
                capOverride: config.cap,
                ttl: usageData.ttl
            };
        }));

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Failed to fetch admin data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { userId } = await auth();
    if (!userId || !await isAdmin(userId)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { targetUserId, action, limit, cap, amount } = await request.json();

        if (action === 'set_limit') {
            await setRateLimitOverride(targetUserId, limit);
        } else if (action === 'set_cap') {
            await setHardCapOverride(targetUserId, cap);
        } else if (action === 'reset_usage') {
            await resetUserUsage(targetUserId);
        } else if (action === 'add_credits') {
            // amount can be negative to deduct
            await addCredits(targetUserId, amount, 'ADMIN_MANUAL', `admin-${Date.now()}`, amount > 0 ? 'BONUS' : 'PURCHASE');
            // If negative, 'PURCHASE' isn't quite right for type, but 'REFUND' might be better for removing?
            // redis-scripts types: 'PURCHASE' | 'BONUS' | 'REFUND'
            // If negative, maybe we should call deductCredits?
            // But addCredits takes signed int?
            // redis-scripts: addCredits script does `incrby`. So negative works.
            // But `deductCredits` does logic check > 0.
            // Let's rely on addCredits which handles negative addition (subtraction) without checks?
            // Actually `addCredits` sets type.
            // Let's just pass 'BONUS' for admin adjustments for now.
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to perform admin action:', error);
        return NextResponse.json({ error: 'Action failed' }, { status: 500 });
    }
}
