import { NextResponse } from 'next/server';
import { getSources, addSource } from '@/lib/store';

export async function GET() {
    try {
        const sources = await getSources();
        return NextResponse.json(sources);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newSource = await addSource(body);
        return NextResponse.json(newSource);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
    }
}
