import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const LOGS_FILE = path.join(process.cwd(), 'data', 'logs.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Read logs
async function getLogs() {
    await ensureDataDir();
    try {
        const data = await fs.readFile(LOGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save logs
async function saveLogs(logs: any[]) {
    await ensureDataDir();
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
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
