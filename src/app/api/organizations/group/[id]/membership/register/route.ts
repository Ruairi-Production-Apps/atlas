import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generatePaymentSchedule } from '@/lib/membership-helpers'
import { stripe } from '@/lib/stripe'
import { eurosToCents } from '@/lib/stripe-helpers'

// GET - Retrieve existing registrations for the current user in this group
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: registrations, error } = await supabase
        .from('membership_registrations')
        .select(`
            *,
            payment_schedules (*)
        `)
        .eq('group_id', groupId)
        .eq('user_id', user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ registrations: registrations || [] })
}

// POST - Submit a registration (draft or final)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()
    const body = await request.json()
    const { members, is_draft, payment_method } = body

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch group membership config for calculations
    const { data: config, error: configError } = await supabase
        .from('membership_configs')
        .select(`
            *,
            group:groups(stripe_account_id, slug),
            membership_fee_items(*)
        `)
        .eq('group_id', groupId)
        .single()

    if (configError) {
        return NextResponse.json({ error: 'Could not load group membership configuration' }, { status: 400 })
    }

    if (!config.group?.stripe_account_id) {
        return NextResponse.json({ error: 'Stripe is not configured for this group' }, { status: 400 })
    }

    // 2. Map and prepare registrations
    const registrationsToUpsert = members.map((member: any) => ({
        id: member.id || undefined, // Allow updating existing registrations (drafts)
        group_id: groupId,
        user_id: user.id,
        parent_name: member.parent_name,
        member_name: member.member_name,
        member_details: member.details,
        status: is_draft ? 'draft' : 'submitted',
        total_amount: 0, // Will calculate below
        is_paid: false
    }))

    // 3. Calculate totals with multi-child discount
    let totalGroupAmount = 0
    let childCount = 0

    const updatedRegistrations = registrationsToUpsert.map((reg: any) => {
        let childTotal = 0
        config.membership_fee_items.forEach((item: any) => {
            let itemAmount = item.amount
            if (config.enable_multi_child_discount && childCount > 0 && item.apply_discount) {
                if (config.discount_type === 'percentage') {
                    itemAmount = itemAmount * (1 - (config.discount_value / 100))
                } else {
                    itemAmount = Math.max(0, itemAmount - config.discount_value)
                }
            }
            childTotal += itemAmount
        })
        reg.total_amount = childTotal
        totalGroupAmount += childTotal
        childCount++
        return reg
    })

    // 4. Save registrations
    const { data: savedRegistrations, error: regError } = await supabase
        .from('membership_registrations')
        .upsert(updatedRegistrations)
        .select()

    if (regError) {
        return NextResponse.json({ error: regError.message }, { status: 400 })
    }

    // 5. Generate Payment Schedule if not a draft
    let firstInstallmentTotal = 0
    let allSchedules: any[] = []

    if (!is_draft && savedRegistrations && savedRegistrations.length > 0) {
        const schedulePromises = savedRegistrations.map(async (reg: any) => {
            const items = generatePaymentSchedule(
                reg.total_amount,
                payment_method,
                {
                    schedule_start_date: config.schedule_start_date,
                    schedule_end_date: config.schedule_end_date,
                    rounding_mode: config.rounding_mode,
                    tiered_initial_amount: config.tiered_initial_amount,
                    tiered_final_date: config.tiered_final_date
                }
            )

            const schedulesToInsert = items.map(item => ({
                registration_id: reg.id,
                amount: item.amount,
                due_date: item.due_date,
                status: 'pending'
            }))

            // Add the first item's amount to our total to charge now
            firstInstallmentTotal += items[0].amount

            const { data: inserted } = await supabase.from('membership_payment_schedules').insert(schedulesToInsert).select()
            if (inserted) allSchedules.push(...inserted)
            return inserted
        })

        await Promise.all(schedulePromises)
    }

    // 6. Create Stripe Checkout Session if not a draft
    let checkoutUrl = null
    if (!is_draft && firstInstallmentTotal > 0) {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `${config.group?.name || 'Group'} Membership 2026`,
                            description: payment_method === 'full' ? 'Full Payment' : 'Initial Installment',
                        },
                        unit_amount: eurosToCents(firstInstallmentTotal),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // Save payment method for future installments if not "full"
            payment_intent_data: payment_method !== 'full' ? {
                setup_future_usage: 'off_session',
            } : undefined,
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/groups/${config.group.slug}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/groups/${config.group.slug}/membership/register`,
            metadata: {
                registration_ids: JSON.stringify(savedRegistrations.map((r: any) => r.id)),
                payment_method,
                type: 'membership'
            },
        }, {
            stripeAccount: config.group.stripe_account_id,
        })
        checkoutUrl = session.url
    }

    return NextResponse.json({
        registrations: savedRegistrations,
        checkout_url: checkoutUrl,
        message: is_draft ? 'Draft saved successfully' : 'Registration submitted'
    })
}
