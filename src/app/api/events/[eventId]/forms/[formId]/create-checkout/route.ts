import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { calculateTotalPrice, eurosToCents } from '@/lib/stripe-helpers'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ eventId: string; formId: string }> }
) {
    const { eventId, formId } = await params
    const supabase = await createClient()

    try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse request body
        const body = await request.json()
        const { submission_data } = body

        if (!submission_data) {
            return NextResponse.json({ error: 'Missing submission data' }, { status: 400 })
        }

        // Fetch event details
        // Note: Casting to any to select stripe_account_id which is now in DB but not in older static types if not updated
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select(`
                *,
                province:provinces(stripe_account_id),
                county:counties(stripe_account_id),
                group:groups(stripe_account_id)
            `)
            .eq('id', eventId)
            .single()

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        // Get organization Stripe Connect ID
        const org = event.province || event.county || event.group
        if (!org || !org.stripe_account_id) {
            return NextResponse.json({ error: 'Stripe Connect not configured for this organization' }, { status: 400 })
        }

        // Verify payment is required and method is Stripe
        if (!event.require_payment || event.payment_method !== 'stripe') {
            return NextResponse.json({ error: 'This event does not use Stripe payments' }, { status: 400 })
        }

        // Calculate total amount
        const participantKey = Object.keys(submission_data).find(k => k.includes('participant'))
        const participants = submission_data.participants || (participantKey ? submission_data[participantKey] : null) || null
        const totalAmount = calculateTotalPrice(event, participants)

        if (totalAmount <= 0) {
            return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
        }

        // Get form details for metadata
        const { data: form } = await supabase
            .from('event_forms')
            .select('title')
            .eq('id', formId)
            .single()

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: event.title,
                            description: form?.title || 'Event Registration',
                        },
                        unit_amount: eurosToCents(totalAmount),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.slug}/forms/${formId}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.slug}/forms/${formId}/cancel`,
            metadata: {
                event_id: eventId,
                form_id: formId,
                user_id: user.id,
            },
        }, {
            stripeAccount: org.stripe_account_id,
        })

        // Create pending submission
        const { data: pendingSubmission, error: submissionError } = await supabase
            .from('form_submissions')
            .insert({
                form_id: formId,
                user_id: user.id,
                submission_data,
                payment_status: 'pending',
                payment_amount: totalAmount,
                stripe_session_id: session.id,
            })
            .select()
            .single()

        if (submissionError) {
            console.error('Failed to create pending submission:', submissionError)
            return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
        }

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        })

    } catch (error: any) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
