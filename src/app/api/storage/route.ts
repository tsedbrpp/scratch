import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
        return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    try {
        const redisKey = `user:${userId}:storage:${key}`;
        const data = await redis.get(redisKey);
        return NextResponse.json({ value: data ? JSON.parse(data) : null });
    } catch (error) {
        console.error('Failed to fetch storage item:', error);
        return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        const redisKey = `user:${userId}:storage:${key}`;
        await redis.set(redisKey, JSON.stringify(value));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save storage item:', error);
        return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
    }
}
