import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { amount, credits } = body;

        // In a real app, you should look up Price ID from your DB or constants
        // For this implementation, we will create an ad-hoc price or use a standard one
        // To keep it simple and flexible, we'll use line_items with price_data

        if (!amount || !credits) {
            return NextResponse.json({ error: 'Missing amount or credits' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${credits} Analysis Credits`,
                            description: 'Credits for using AI analysis tools',
                        },
                        unit_amount: amount * 100, // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/settings/billing?success=true`,
            cancel_url: `${req.headers.get('origin')}/settings/billing?canceled=true`,
            client_reference_id: userId,
            metadata: {
                credits: credits.toString()
            }
        });

        console.log("[Checkout API] Session created:", session.id);
        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error('[Checkout API] Error creating checkout session:', err);
        return NextResponse.json({ error: `Stripe Error: ${err.message}` }, { status: 500 });
    }
}
