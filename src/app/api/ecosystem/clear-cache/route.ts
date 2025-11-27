import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';

export async function POST() {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        // Get all keys matching the ecosystem simulation pattern for this user
        const keys = await redis.keys(`user:${userId}:ecosystem:simulate:*`);

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
