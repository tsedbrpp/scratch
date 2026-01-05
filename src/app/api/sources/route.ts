import { NextRequest, NextResponse } from 'next/server';
import { getSources, addSource } from '@/lib/store';

import { getAuthenticatedUserId } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);

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
    const userId = await getAuthenticatedUserId(request);

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
