import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

function replaceTemplateVariables(
    template: string,
    vars: Record<string, string>
): string {
    let result = template
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    }
    return result
}

// POST - Automatically resend a fresh magic link if the old one expired
export async function POST(request: Request) {
    const { registrationId, magicLinkToken } = await body_JSON(request)

    if (!registrationId && !magicLinkToken) {
        return NextResponse.json({ error: 'Missing registrationId or token' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Fetch registration and its most recent pending reminder
    const query = adminClient
        .from('membership_registrations')
        .select(`
            *,
            membership_configs!inner(
                id,
                groups!inner(id, name, logo_url, stripe_account_id)
            ),
            parent_profile:profiles!parent_id(email, first_name, last_name)
        `)

    if (registrationId) {
        query.eq('id', registrationId)
    } else {
        query.eq('magic_link_token', magicLinkToken)
    }

    const { data: registration, error: regError } = await query.single()

    if (regError || !registration) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // 2. Find the most recent manual reminder or the "Payment Required" reminder
    const { data: reminder } = await adminClient
        .from('membership_reminders')
        .select('*')
        .eq('config_id', registration.membership_configs.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (!reminder) {
        return NextResponse.json({ error: 'No active reminder template found' }, { status: 400 })
    }

    // 3. Find latest pending schedule
    const { data: schedule } = await adminClient
        .from('membership_payment_schedules')
        .select('*')
        .eq('registration_id', registration.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(1)
        .single()

    // 4. Generate new token
    const newToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await adminClient
        .from('membership_registrations')
        .update({
            magic_link_token: newToken,
            magic_link_expires_at: expiresAt
        })
        .eq('id', registration.id)

    // 5. Send Email (logic copied from reminders API)
    const host = request.headers.get('host')
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    const siteUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'https://atlashub.ie')

    const group = registration.membership_configs.groups
    const parentProfile = registration.parent_profile
    const children = registration.submission_data?.children || []
    const childNames = children.map((c: any) => c.name).join(', ')

    // Fetch paid to date
    const { data: paidSchedules } = await adminClient
        .from('membership_payment_schedules')
        .select('amount')
        .eq('registration_id', registration.id)
        .eq('status', 'paid')

    const amountPaidToDate = (paidSchedules || []).reduce(
        (sum: number, s: any) => sum + parseFloat(s.amount), 0
    )

    const templateVars: Record<string, string> = {
        parent_name: `${parentProfile.first_name} ${parentProfile.last_name}`,
        parent_first_name: parentProfile.first_name,
        child_names: childNames || 'your children',
        group_name: group.name,
        amount_due: schedule ? `€${parseFloat(schedule.amount).toFixed(2)}` : '€0.00',
        amount_paid_to_date: `€${amountPaidToDate.toFixed(2)}`,
        total_balance: `€${(parseFloat(registration.net_fee) || parseFloat(registration.total_fee) || 0).toFixed(2)}`,
        due_date: schedule ? new Date(schedule.due_date).toLocaleDateString('en-IE') : 'N/A',
        dashboard_link: `${siteUrl}/dashboard`,
        payment_link: `${siteUrl}/membership/pay/${newToken}`,
    }

    const emailSubject = replaceTemplateVariables(reminder.subject, templateVars)
    let emailBody = replaceTemplateVariables(reminder.body_text, templateVars)

    // Final HTML processing
    let htmlBody = emailBody
        .replace(/\n/g, '<br>')
        .replace(/€/g, '&euro;')
        // Ensure links are clickable if they look like URLs and aren't already in tags
        .replace(/(https?:\/\/[^\s<]+)/g, (url) => {
            return `<a href="${url}" style="color: #059669; font-weight: 600; text-decoration: underline;">${url}</a>`
        })

    if (group.logo_url) {
        htmlBody = `<img src="${group.logo_url}" style="max-height: 60px; margin-bottom: 20px;" /><br/>${htmlBody}`
    }

    await sendEmail({
        from: `${group.name} <onboarding@resend.dev>`,
        to: parentProfile.email,
        subject: `NEW LINK: ${emailSubject}`,
        html: htmlBody,
    })

    return NextResponse.json({ success: true })
}

async function body_JSON(request: Request) {
    try {
        return await request.json()
    } catch {
        return {}
    }
}
