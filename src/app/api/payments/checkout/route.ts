import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { CREDIT_PACKAGES, PackageId } from '@/config/pricing';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { packageId } = body;

        if (!packageId || !CREDIT_PACKAGES[packageId as PackageId]) {
            return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
        }

        const selectedPackage = CREDIT_PACKAGES[packageId as PackageId];
        const { price, credits, name } = selectedPackage;

        // Fetch user email from Clerk to pre-fill Stripe Checkout
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const userEmail = user.emailAddresses[0]?.emailAddress;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${credits} Analysis Credits`,
                            description: `Purchase of ${name}`,
                        },
                        unit_amount: price * 100, // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/settings/billing?success=true`,
            cancel_url: `${req.headers.get('origin')}/settings/billing?canceled=true`,
            client_reference_id: userId,
            metadata: {
                credits: credits.toString(),
                packageId: packageId
            }
        });

        console.log("[Checkout API] Session created:", session.id);
        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: unknown) {
        console.error('[Checkout API] Error creating checkout session:', err);
        return NextResponse.json({ error: `Stripe Error: ${(err as Error).message}` }, { status: 500 });
    }
}
