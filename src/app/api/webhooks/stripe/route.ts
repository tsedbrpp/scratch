import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { addCredits } from '@/lib/redis-scripts';
import Stripe from 'stripe';

// This is required for webhooks to handle raw body
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
            console.error("[Stripe Webhook] Missing signature or secret");
            throw new Error('Missing signature or secret');
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: unknown) {
        console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const userId = session.client_reference_id;
        const amountPurchased = parseInt(session.metadata?.credits || '0', 10);

        // Fallback: If using a fixed price ID, you might map it to credits here
        // But passing it in metadata is safer/easier for dynamic implementation

        if (userId && amountPurchased > 0) {
            console.log(`[Stripe Webhook] Adding ${amountPurchased} credits to user ${userId}`);
            try {
                // Determine payment Ref
                const referenceId = session.payment_intent as string || session.id;

                await addCredits(userId, amountPurchased, 'STRIPE', referenceId, 'PURCHASE');
                console.log(`[Stripe Webhook] Successfully credited user ${userId}`);
            } catch (error) {
                console.error('[Stripe Webhook] Failed to add credits:', error);
                return NextResponse.json({ error: 'Failed to credit user' }, { status: 500 });
            }
        } else {
            console.warn('[Stripe Webhook] Missing userId or credits metadata', { userId, metadata: session.metadata });
        }
    }

    return NextResponse.json({ received: true });
}
