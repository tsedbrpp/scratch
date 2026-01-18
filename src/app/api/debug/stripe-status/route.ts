
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const key = process.env.STRIPE_SECRET_KEY || '';
    const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

    return NextResponse.json({
        node_env: process.env.NODE_ENV,
        secret_key_prefix: key.substring(0, 8) + '...', // Safe preview (e.g., sk_live_...)
        publishable_key_prefix: pubKey.substring(0, 8) + '...', // Safe preview
        webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
        redis_configured: !!process.env.REDIS_URL,
        timestamp: new Date().toISOString()
    });
}
