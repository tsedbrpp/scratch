import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage-service';
import { auth } from '@clerk/nextjs/server';
import { isReadOnlyAccess } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
    let { userId } = await auth();

    // Check for demo user if not authenticated
    if (!userId && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
        return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    try {
        const data = await StorageService.get(userId, key);
        return NextResponse.json({ value: data });
    } catch (error) {
        console.error('Failed to fetch storage item:', error);
        return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // Block write operations in Read-Only / Demo Mode
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Storage updates disabled in Demo Mode" }, { status: 403 });
    }

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

        await StorageService.set(userId, key, value);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save storage item:', error);
        return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
    }
}
