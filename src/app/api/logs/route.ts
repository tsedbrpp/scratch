import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';

// Define a type for the log entry
type LogEntry = {
    id: string;
    timestamp: string;
    [key: string]: unknown; // Allow other properties
};

// Helper function to get logs
async function getLogs(userId: string): Promise<LogEntry[]> {
    const logsKey = `user:${userId}:logs`;
    const data = await redis.get(logsKey);
    return data ? JSON.parse(data) : [];
}

// Helper function to save logs
async function saveLogs(userId: string, logs: LogEntry[]) {
    const logsKey = `user:${userId}:logs`;
    await redis.set(logsKey, JSON.stringify(logs));
}

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
        const logs: LogEntry[] = await getLogs(userId);
        return NextResponse.json(logs);
    } catch {
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

        // Fetch existing logs
        const logs: LogEntry[] = await getLogs(userId);

        // Add new log
        const newLog: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            ...body
        };
        logs.unshift(newLog); // Add to beginning

        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.length = 1000;
        }

        await saveLogs(userId, logs);

        return NextResponse.json(newLog);
    } catch {
        return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
    }
}
