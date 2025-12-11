import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { setRateLimitOverride, setHardCapOverride, getUserRateLimitConfig, resetUserUsage } from '@/lib/ratelimit';
import { redis } from '@/lib/redis';
import { createClerkClient } from '@clerk/nextjs/server';

// Helper to check if user is admin
async function isAdmin(userId: string) {
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    const isAuthorized = adminIds.includes(userId);

    if (!isAuthorized) {
        console.log(`[Admin Access Attempt] Blocked user: ${userId}. To authorize, add this ID to ADMIN_USER_IDS in .env.local`);
    }

    return isAuthorized;
}

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

        // 4. Merge data
        const users = await Promise.all(clerkUsers.data.map(async (user) => {
            const usageData = usageMap.get(user.id) || { usage: 0, ttl: -1 };
            const totalUsage = totalUsageMap.get(user.id) || 0;
            const config = await getUserRateLimitConfig(user.id);

            return {
                userId: user.id,
                email: user.emailAddresses[0]?.emailAddress || 'No Email',
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name',
                usage: usageData.usage,
                totalUsage,
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
        const { targetUserId, action, limit, cap } = await request.json();

        if (action === 'set_limit') {
            await setRateLimitOverride(targetUserId, limit);
        } else if (action === 'set_cap') {
            await setHardCapOverride(targetUserId, cap);
        } else if (action === 'reset_usage') {
            await resetUserUsage(targetUserId);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to perform admin action:', error);
        return NextResponse.json({ error: 'Action failed' }, { status: 500 });
    }
}
