import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { sendEmail } from '@/lib/email'

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

                if (metadata.membership_registration_id) {
                    // Handle Membership Payment
                    const registrationId = metadata.membership_registration_id
                    const scheduleId = metadata.membership_schedule_id

                    console.log(`💰 Membership payment: registration=${registrationId}, schedule=${scheduleId}`)

                    // Mark the schedule as paid
                    if (scheduleId) {
                        const { error: scheduleError } = await supabase
                            .from('membership_payment_schedules')
                            .update({
                                status: 'paid',
                                paid_at: new Date().toISOString(),
                                payment_intent_id: session.payment_intent as string,
                            })
                            .eq('id', scheduleId)

                        if (scheduleError) {
                            console.error('Failed to update payment schedule:', scheduleError)
                        } else {
                            console.log(`✅ Payment schedule ${scheduleId} marked as paid`)
                        }
                    }

                    // Fetch registration to recalculate status and for invoice details
                    const { data: reg, error: regError } = await supabase
                        .from('membership_registrations')
                        .select(`
                            *,
                            config:membership_configs (
                                id,
                                group:groups (name, logo_url)
                            )
                        `)
                        .eq('id', registrationId)
                        .single()

                    if (regError || !reg) {
                        console.error('Failed to fetch registration for reconciliation:', regError)
                        break
                    }

                    // Recalculate registration payment status
                    const { data: allSchedules } = await supabase
                        .from('membership_payment_schedules')
                        .select('amount, status')
                        .eq('registration_id', registrationId)

                    if (allSchedules) {
                        const totalPaid = allSchedules
                            .filter((s: any) => s.status === 'paid')
                            .reduce((sum: number, s: any) => sum + parseFloat(s.amount), 0)
                        const totalFee = parseFloat(reg.net_fee) || parseFloat(reg.total_fee) || 0
                        const newStatus = totalPaid >= totalFee ? 'paid'
                            : totalPaid > 0 ? 'active'
                                : 'pending'

                        await supabase
                            .from('membership_registrations')
                            .update({ payment_status: newStatus })
                            .eq('id', registrationId)

                        console.log(`📊 Registration ${registrationId} status updated to: ${newStatus}`)

                        // 4. Send Invoice Email
                        try {
                            // @ts-ignore
                            const group = reg.config?.group
                            const amountPaid = session.amount_total ? session.amount_total / 100 : 0
                            const parentEmail = session.customer_details?.email || reg.submission_data?.parent_email

                            if (parentEmail && group) {
                                const children = reg.submission_data?.children || []
                                const childNames = children.map((c: any) => c.name).join(', ')

                                let invoiceBody = `
                                    <h2>Payment Receipt</h2>
                                    <p>Hi ${reg.submission_data?.parent_first_name || 'there'},</p>
                                    <p>Thank you for your payment to <strong>${group.name}</strong>.</p>
                                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280;">Payment For:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: 500;">Membership (${childNames || 'Child'})</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #059669;">€${amountPaid.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280;">Transaction ID:</td>
                                                <td style="padding: 8px 0; text-align: right; font-size: 12px; font-family: monospace;">${session.id.slice(-12)}</td>
                                            </tr>
                                            <tr style="border-top: 1px solid #e5e7eb;">
                                                <td style="padding: 12px 0 8px; color: #6b7280;">Remaining Balance:</td>
                                                <td style="padding: 12px 0 8px; text-align: right; font-weight: 600;">€${Math.max(0, totalFee - totalPaid).toFixed(2)}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    <p style="color: #6b7280; font-size: 14px;">If you have any questions, please contact your group leader.</p>
                                `

                                if (group.logo_url) {
                                    invoiceBody = `<div style="margin-bottom: 20px;"><img src="${group.logo_url}" style="max-height: 60px;" /></div>${invoiceBody}`
                                }

                                await sendEmail({
                                    from: `${group.name} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                                    to: parentEmail,
                                    subject: `Payment Receipt - ${group.name}`,
                                    html: invoiceBody
                                })
                                console.log(`📧 Invoice sent to ${parentEmail}`)
                            }
                        } catch (emailErr) {
                            console.error('Failed to send invoice email:', emailErr)
                        }
                    }
                } else if (metadata.order_id) {
                    // Handle Store Order
                    // Handle Store Order
                    const { data, error } = await supabase
                        .from('store_orders')
                        .update({
                            status: 'paid',
                            stripe_payment_intent_id: session.payment_intent as string,
                        })
                        .eq('id', metadata.order_id)
                        .select('id')

                    if (error) {
                        console.error('Failed to update store order:', error)
                        throw error
                    } else if (!data || data.length === 0) {
                        console.error(`⚠️  Store Order ${metadata.order_id} not found or not updated`)
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
