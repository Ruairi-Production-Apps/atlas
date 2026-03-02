import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { eurosToCents } from '@/lib/stripe-helpers'

// POST - Create a Stripe Checkout Session for membership payment
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const body = await request.json()
    const { registration_id, amount } = body

    if (!registration_id || !amount || amount <= 0) {
        return NextResponse.json({ error: 'Missing registration_id or invalid amount' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Get registration details
    const { data: registration, error: regError } = await adminClient
        .from('membership_registrations')
        .select(`
            *,
            membership_configs!inner(group_id, min_payment_amount)
        `)
        .eq('id', registration_id)
        .single()

    if (regError || !registration) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Verify this registration belongs to this group
    if (registration.membership_configs.group_id !== groupId) {
        return NextResponse.json({ error: 'Registration does not belong to this group' }, { status: 403 })
    }

    // 2. Check minimum payment amount
    const minAmount = parseFloat(registration.membership_configs.min_payment_amount) || 5
    if (amount < minAmount) {
        return NextResponse.json({
            error: `Minimum payment amount is €${minAmount.toFixed(2)}`
        }, { status: 400 })
    }

    // 3. Calculate remaining balance
    const { data: paidSchedules } = await adminClient
        .from('membership_payment_schedules')
        .select('amount')
        .eq('registration_id', registration_id)
        .eq('status', 'paid')

    const totalPaid = (paidSchedules || []).reduce(
        (sum: number, s: any) => sum + parseFloat(s.amount), 0
    )
    const totalFee = parseFloat(registration.net_fee) || parseFloat(registration.total_fee) || 0
    const remainingBalance = totalFee - totalPaid

    if (amount > remainingBalance + 0.01) { // small float tolerance
        return NextResponse.json({
            error: `Payment amount (€${amount.toFixed(2)}) exceeds remaining balance (€${remainingBalance.toFixed(2)})`
        }, { status: 400 })
    }

    // 4. Get group's Stripe Connect account
    const { data: group } = await adminClient
        .from('groups')
        .select('stripe_account_id, name')
        .eq('id', groupId)
        .single()

    if (!group?.stripe_account_id) {
        return NextResponse.json({
            error: 'This group has not connected their Stripe account. Please contact your group leader.'
        }, { status: 400 })
    }

    // 5. Get parent details for description
    const parentName = registration.submission_data?.parent_name || 'Parent'
    const childNames = (registration.submission_data?.children || [])
        .map((c: any) => c.name).join(', ')

    // 6. Create payment schedule record first
    const { data: schedule, error: scheduleError } = await adminClient
        .from('membership_payment_schedules')
        .insert({
            registration_id,
            due_date: new Date().toISOString().split('T')[0],
            amount,
            status: 'pending',
            payment_method_type: 'stripe',
            notes: 'Online payment via Stripe',
        })
        .select('id')
        .single()

    if (scheduleError || !schedule) {
        return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
    }

    // 7. Create Stripe Checkout Session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlashub.ie'

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: registration.submission_data?.parent_email || undefined,
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `${group.name} - Membership Payment`,
                            description: `Payment for ${childNames || 'membership'}`,
                        },
                        unit_amount: eurosToCents(amount),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${siteUrl}/membership/pay/${registration_id}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/membership/pay/${registration_id}?cancelled=true`,
            metadata: {
                membership_registration_id: registration_id,
                membership_schedule_id: schedule.id,
                group_id: groupId,
            },
        }, {
            stripeAccount: group.stripe_account_id,
        })

        // Update schedule with stripe session ID
        await adminClient
            .from('membership_payment_schedules')
            .update({ stripe_session_id: session.id })
            .eq('id', schedule.id)

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        })
    } catch (err: any) {
        // Clean up the pending schedule if Stripe fails
        await adminClient
            .from('membership_payment_schedules')
            .delete()
            .eq('id', schedule.id)

        return NextResponse.json({
            error: `Stripe error: ${err.message}`
        }, { status: 500 })
    }
}
