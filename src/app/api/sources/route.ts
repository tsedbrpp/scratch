import { NextResponse } from 'next/server';
import { getSources, addSource } from '@/lib/store';

import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        const sources = await getSources(userId);
        return NextResponse.json(sources);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        const body = await request.json();
        const newSource = await addSource(userId, body);
        return NextResponse.json(newSource);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
    }
}
