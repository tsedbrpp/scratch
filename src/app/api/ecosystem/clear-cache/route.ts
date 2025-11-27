import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST() {
    try {
        // Get all keys matching the ecosystem simulation pattern
        const keys = await redis.keys('ecosystem:simulate:*');

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
