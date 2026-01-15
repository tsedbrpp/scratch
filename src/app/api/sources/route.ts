import { NextRequest, NextResponse } from 'next/server';
import { getSources, addSource } from '@/lib/store';
import { getAuthenticatedUserId, isReadOnlyAccess } from '@/lib/auth-helper';

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
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Uploads disabled in Demo Mode" }, { status: 403 });
    }

    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        // Optional: Check content-length if available for early rejection
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Payload too large (Max 10MB)' }, { status: 413 });
        }

        const body = await request.json();
        const newSource = await addSource(userId, body);
        return NextResponse.json(newSource);
    } catch {
        return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
    }
}
