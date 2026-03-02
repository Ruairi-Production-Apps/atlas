import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
    console.warn('STRIPE_SECRET_KEY is missing. Payment features will be disabled.');
}

// We provide a fallback key to prevent the constructor from throwing during Vercel builds
// where the user may not have provided a key yet.
export const stripe = new Stripe(secretKey || 'sk_test_mock_key_for_build', {
    apiVersion: '2025-11-17.clover' as any,
    typescript: true,
})
