import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
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
        const logsKey = `user:${userId}:logs`;
        const data = await redis.get(logsKey);
        const logs = data ? JSON.parse(data) : [];
        return NextResponse.json(logs);
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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
        const body = await request.json();
        const logsKey = `user:${userId}:logs`;

        // Fetch existing logs
        const data = await redis.get(logsKey);
        const logs = data ? JSON.parse(data) : [];

        // Add new log
        const newLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            ...body
        };
        logs.unshift(newLog); // Add to beginning

        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.length = 1000;
        }

        await redis.set(logsKey, JSON.stringify(logs));

        return NextResponse.json(newLog);
    } catch (error) {
        console.error('Failed to save log:', error);
        return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
    }
}
