import Stripe from 'stripe';

// To prevent build failures when the environment variable is missing (common during build steps),
// we provide a placeholder. However, this will cause runtime errors if used without a real key.
const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing. Using placeholder key. Stripe features will fail if not configured.');
}

export const stripe = new Stripe(apiKey, {
    typescript: true,
});
