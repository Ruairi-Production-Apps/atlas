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

    const { data: config, error: configError } = await supabase
        .from('membership_configs')
        .select('id')
        .eq('group_id', groupId)
        .single()

    if (configError || !config) {
        return NextResponse.json({ registrations: [] })
    }

    const { data: registrations, error } = await supabase
        .from('membership_registrations')
        .select('*, membership_payment_schedules(*)')
        .eq('config_id', config.id)
        .eq('parent_id', user.id)

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

    // 1. Fetch group membership config
    const { data: config, error: configError } = await supabase
        .from('membership_configs')
        .select(`
            *,
            group:groups(stripe_account_id, slug, name),
            membership_fee_items(*)
        `)
        .eq('group_id', groupId)
        .single()

    if (configError || !config) {
        return NextResponse.json({ error: 'Could not load group membership configuration' }, { status: 400 })
    }

    if (!config.group?.stripe_account_id) {
        return NextResponse.json({ error: 'Stripe is not configured for this group' }, { status: 400 })
    }

    // 2. Calculate totals for all members combined with multi-child discount
    let totalFee = 0
    let totalDiscount = 0

    members.forEach((member: any, index: number) => {
        config.membership_fee_items.forEach((item: any) => {
            totalFee += item.amount
            if (config.enable_multi_child_discount && index > 0 && item.apply_discount) {
                if (config.discount_type === 'per_child') {
                    const perChildDiscounts = config.per_child_discounts || []
                    const childDiscount = perChildDiscounts[index - 1] || 0
                    totalDiscount += Math.min(item.amount, childDiscount)
                } else if (config.discount_type === 'percentage') {
                    totalDiscount += item.amount * (config.discount_value / 100)
                } else {
                    totalDiscount += Math.min(item.amount, config.discount_value)
                }
            }
        })
    })

    const netFee = Math.max(0, totalFee - totalDiscount)

    // 3. Save single registration for the whole family
    const registrationToUpsert = {
        config_id: config.id,
        parent_id: user.id,
        submission_data: { members },
        total_fee: totalFee,
        net_fee: netFee,
        payment_method,
        payment_status: is_draft ? 'draft' : 'pending'
    }

    const { data: savedRegistration, error: regError } = await supabase
        .from('membership_registrations')
        .upsert(registrationToUpsert)
        .select()
        .single()

    if (regError || !savedRegistration) {
        return NextResponse.json({ error: regError?.message || 'Failed to save registration' }, { status: 400 })
    }

    // 4. Generate payment schedule if not a draft
    let firstInstallmentAmount = 0
    let firstScheduleId: string | null = null

    if (!is_draft) {
        const scheduleItems = generatePaymentSchedule(
            savedRegistration.net_fee,
            payment_method,
            {
                schedule_start_date: config.schedule_start_date,
                schedule_end_date: config.schedule_end_date,
                rounding_mode: config.rounding_mode,
                tiered_initial_amount: config.tiered_initial_amount,
                tiered_final_date: config.tiered_final_date
            }
        )

        const schedulesToInsert = scheduleItems.map(item => ({
            registration_id: savedRegistration.id,
            amount: item.amount,
            due_date: item.due_date,
            status: 'pending'
        }))

        firstInstallmentAmount = scheduleItems[0]?.amount ?? savedRegistration.net_fee

        const { data: insertedSchedules } = await supabase
            .from('membership_payment_schedules')
            .insert(schedulesToInsert)
            .select()

        firstScheduleId = insertedSchedules?.[0]?.id ?? null
    }

    // 5. Create Stripe Checkout Session if not a draft
    let checkoutUrl = null
    if (!is_draft && firstInstallmentAmount > 0) {
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
                        unit_amount: eurosToCents(firstInstallmentAmount),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            payment_intent_data: payment_method !== 'full' ? {
                setup_future_usage: 'off_session',
            } : undefined,
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/groups/${config.group.slug}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/groups/${config.group.slug}/membership/register`,
            metadata: {
                membership_registration_id: savedRegistration.id,
                membership_schedule_id: firstScheduleId ?? '',
                payment_method,
                type: 'membership'
            },
        }, {
            stripeAccount: config.group.stripe_account_id,
        })
        checkoutUrl = session.url
    }

    return NextResponse.json({
        registration: savedRegistration,
        checkout_url: checkoutUrl,
        message: is_draft ? 'Draft saved successfully' : 'Registration submitted'
    })
}
