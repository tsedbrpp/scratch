import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { userId } = await auth();
    return NextResponse.json({
        authDecodedUserId: userId,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        secretKeyPrefix: process.env.CLERK_SECRET_KEY ? process.env.CLERK_SECRET_KEY.substring(0, 10) : 'MISSING',
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        demoMode: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE,
        demoUserId: process.env.NEXT_PUBLIC_DEMO_USER_ID,
        adminUserId: process.env.ADMIN_USER_IDS,
    });
}
