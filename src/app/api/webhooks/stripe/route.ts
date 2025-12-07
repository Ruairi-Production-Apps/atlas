import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

export async function POST(request: Request) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    try {
        // Use Service Role Key to bypass RLS for webhook updates
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // We need to get the webhook secret from the organization
        // For now, we'll use an environment variable as fallback
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

        if (!webhookSecret) {
            console.error('No webhook secret configured')
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
        }

        // Initialize Stripe with a temporary key just for webhook verification
        // We'll get the actual key from the organization later
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        })

        // Verify webhook signature
        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err: any) {
            console.error(`⚠️  Webhook signature verification failed.`, err.message)
            return NextResponse.json({ error: `Signature Failed: ${err.message}` }, { status: 400 })
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const metadata = session.metadata || {}

                console.log(`✅  Processing Checkout Session: ${session.id}, Order: ${metadata.order_id}`)

                if (metadata.order_id) {
                    // Handle Store Order
                    const { error, count } = await supabase
                        .from('store_orders')
                        .update({
                            status: 'paid',
                            stripe_payment_intent_id: session.payment_intent as string,
                        })
                        .eq('id', metadata.order_id)
                        .select('id', { count: 'exact' })

                    if (error) {
                        console.error('Failed to update store order:', error)
                        throw error
                    } else if (count === 0) {
                        console.error(`⚠️  Store Order ${metadata.order_id} not found or not updated (count: ${count})`)
                    } else {
                        console.log(`🎉  Store Order ${metadata.order_id} marked as PAID`)
                    }
                } else {
                    // Handle Form Submission (Event)
                    const { error } = await supabase
                        .from('form_submissions')
                        .update({
                            payment_status: 'paid',
                            stripe_payment_intent_id: session.payment_intent as string,
                        })
                        .eq('stripe_session_id', session.id)

                    if (error) {
                        console.error('Failed to update submission:', error)
                    }
                }

                break
            }
            // ... (keep payment_intent logic if needed, or just let default handle it? 
            // The user logs showed payment_intent failing with 400, so they MUST pass verification first)

            case 'payment_intent.payment_failed': {
                // ... existing logic ...
                break
            }

            default:
            // console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('Webhook handler failed:', error)
        return NextResponse.json(
            { error: `Webhook Error: ${error.message}` },
            { status: 400 }
        )
    }
}
