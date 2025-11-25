import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const LOGS_KEY = 'logs';

// Read logs
async function getLogs() {
    try {
        const data = await redis.get(LOGS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to fetch logs from Redis:', error);
        return [];
    }
}

// Save logs
async function saveLogs(logs: any[]) {
    try {
        await redis.set(LOGS_KEY, JSON.stringify(logs));
    } catch (error) {
        console.error('Failed to save logs to Redis:', error);
        throw error;
    }
}

export async function GET() {
    try {
        const logs = await getLogs();
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, details, timestamp } = body;

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        const newLog = {
            id: crypto.randomUUID(),
            action,
            details: details || {},
            timestamp: timestamp || new Date().toISOString(),
        };

        const logs = await getLogs();
        logs.unshift(newLog); // Add to beginning
        await saveLogs(logs);

        return NextResponse.json(newLog);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
    }
}

