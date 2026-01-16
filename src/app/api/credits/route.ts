import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCredits, addCredits, getTransactions } from '@/lib/redis-scripts';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [balance, history] = await Promise.all([
            getCredits(userId),
            getTransactions(userId, 50)
        ]);
        console.log(`[API] /credits for user ${userId} => Balance: ${balance}`);
        return NextResponse.json({ credits: balance, history });
    } catch (error) {
        console.error('Error fetching credits:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { amount, referenceId } = body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }
        if (!referenceId) {
            return NextResponse.json({ error: 'Missing referenceId' }, { status: 400 });
        }

        await addCredits(userId, amount, 'MOCK_PAYMENT', referenceId, 'PURCHASE');

        const newBalance = await getCredits(userId);
        return NextResponse.json({ success: true, credits: newBalance });
    } catch (error) {
        console.error('Error adding credits:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
