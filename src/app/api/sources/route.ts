import { NextRequest, NextResponse } from 'next/server';
import { getSources, addSource } from '@/lib/store';

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
        const sources = await getSources(userId);
        return NextResponse.json(sources);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
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
        const newSource = await addSource(userId, body);
        return NextResponse.json(newSource);
    } catch {
        return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
    }
}
