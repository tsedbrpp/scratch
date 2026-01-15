import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTransactions } from '@/lib/redis-scripts';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId || !await isAdmin(userId)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
        return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    try {
        const history = await getTransactions(targetUserId, 50);
        return NextResponse.json({ history });
    } catch (error) {
        console.error('Failed to fetch user history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
