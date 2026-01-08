import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    let { userId } = await auth();

    // Check for demo user if not authenticated
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        // Get all keys matching the ecosystem simulation pattern for this user
        const keys = await redis.keys(`user:${userId}:cache:ecosystem:simulate:*`);
        // Force clear the assemblage extraction prompt override to ensure updates take effect
        const overrideKey = `user:${userId}:store:prompt_override:assemblage_extraction`;
        keys.push(overrideKey);

        if (keys.length > 0) {
            await redis.del(...keys);
            return NextResponse.json({
                success: true,
                message: `Cleared ${keys.length} cached simulation(s)`
            });
        }

        return NextResponse.json({
            success: true,
            message: 'No cached simulations found'
        });
    } catch (error) {
        console.error('Failed to clear cache:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to clear cache' },
            { status: 500 }
        );
    }
}
