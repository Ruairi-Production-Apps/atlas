import { createAdminClient } from '@/lib/supabase/admin'
import { Metadata } from 'next'
import { MembershipPaymentClient } from './client'

export const metadata: Metadata = {
    title: 'Membership Payment',
    description: 'Pay your membership fees online',
}

interface PageProps {
    params: Promise<{ registrationId: string }>
}

export default async function MembershipPayPage({ params }: PageProps) {
    const { registrationId: idOrToken } = await params
    const adminClient = createAdminClient()

    // 1. Try to fetch by magic_link_token first
    let { data: registration, error: nError } = await adminClient
        .from('membership_registrations')
        .select(`
            *,
            membership_configs!inner(
                group_id,
                min_payment_amount,
                groups!inner(name, logo_url, stripe_account_id)
            )
        `)
        .eq('magic_link_token', idOrToken)
        .maybeSingle()

    if (nError) {
        console.error("[Payment Page] Error fetching by token:", {
            token: idOrToken,
            message: nError.message,
            code: nError.code,
            details: nError.details
        })
    }

    // 2. Fallback to ID (for backward compatibility or direct ID visit)
    if (!registration && idOrToken.length > 20) { // UUIDs are long
        const { data: regById } = await adminClient
            .from('membership_registrations')
            .select(`
                *,
                membership_configs!inner(
                    group_id,
                    min_payment_amount,
                    groups!inner(name, logo_url, stripe_account_id)
                )
            `)
            .eq('id', idOrToken)
            .maybeSingle()
        registration = regById
    }

    if (!registration) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-gray-900">Payment Not Found</h1>
                    <p className="mt-2 text-gray-600">This payment link may be invalid or has expired.</p>
                </div>
            </div>
        )
    }

    // 3. Check for expiration
    const isExpired = registration.magic_link_expires_at
        ? new Date(registration.magic_link_expires_at) < new Date()
        : false

    // Get payment history
    const { data: schedules } = await adminClient
        .from('membership_payment_schedules')
        .select('*')
        .eq('registration_id', registration.id)
        .order('created_at', { ascending: true })

    const paidSchedules = (schedules || []).filter((s: any) => s.status === 'paid')
    const totalPaid = paidSchedules.reduce(
        (sum: number, s: any) => sum + parseFloat(s.amount), 0
    )
    const totalFee = parseFloat(registration.net_fee) || parseFloat(registration.total_fee) || 0
    const remainingBalance = Math.max(0, totalFee - totalPaid)

    const groupId = registration.membership_configs.group_id
    const groupName = registration.membership_configs.groups.name
    const groupLogo = registration.membership_configs.groups.logo_url
    const hasStripe = !!registration.membership_configs.groups.stripe_account_id
    const minPayment = parseFloat(registration.membership_configs.min_payment_amount) || 5
    const parentName = registration.submission_data?.parent_name || 'Parent'
    const parentFirstName = registration.submission_data?.parent_first_name || parentName.split(' ')[0]
    const children = registration.submission_data?.children || []
    const childNames = children.map((c: any) => c.name).join(', ')

    return (
        <MembershipPaymentClient
            registrationId={registration.id}
            magicLinkToken={registration.magic_link_token}
            isExpired={isExpired}
            groupId={groupId}
            groupName={groupName}
            groupLogo={groupLogo}
            parentFirstName={parentFirstName}
            parentName={parentName}
            childNames={childNames}
            totalFee={totalFee}
            totalPaid={totalPaid}
            remainingBalance={remainingBalance}
            minPayment={minPayment}
            hasStripe={hasStripe}
            paidSchedules={paidSchedules.map((s: any) => ({
                amount: parseFloat(s.amount),
                paid_at: s.paid_at,
            }))}
            paymentStatus={registration.payment_status}
        />
    )
}
