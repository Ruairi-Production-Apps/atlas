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

// POST - Automatically resend a fresh magic link if the old one expired, or look up by email
export async function POST(request: Request) {
    const { registrationId, magicLinkToken, email } = await body_JSON(request)

    if (!registrationId && !magicLinkToken && !email) {
        return NextResponse.json({ error: 'Missing registrationId, token, or email' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Email-based lookup: find the most recent pending registration for this email
    let resolvedRegistrationId = registrationId
    if (!resolvedRegistrationId && !magicLinkToken && email) {
        const { data: profile } = await adminClient
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle()

        if (!profile) {
            // Silent success — don't reveal whether email exists
            return NextResponse.json({ success: true })
        }

        const { data: reg } = await adminClient
            .from('membership_registrations')
            .select('id')
            .eq('parent_id', profile.id)
            .neq('payment_status', 'paid')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (!reg) {
            return NextResponse.json({ success: true })
        }

        resolvedRegistrationId = reg.id
    }

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

    if (resolvedRegistrationId) {
        query.eq('id', resolvedRegistrationId)
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

    // Fall back to a default template if none is configured
    const defaultReminder = {
        subject: 'Your payment link for {{group_name}} membership',
        body_text: `Hi {{parent_first_name}},\n\nHere is your payment link for {{group_name}} membership fees.\n\nAmount due: {{amount_due}}\nDue date: {{due_date}}\n\nClick the link below to pay:\n{{payment_link}}\n\nThis link expires in 24 hours.\n\nThank you,\n{{group_name}}`,
    }

    const activeReminder = reminder ?? defaultReminder

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (() => { const h = request.headers.get('host'); return h?.includes('localhost') ? `http://${h}` : h ? `https://${h}` : 'https://atlashub.ie'; })()

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

    const emailSubject = replaceTemplateVariables(activeReminder.subject, templateVars)
    let emailBody = replaceTemplateVariables(activeReminder.body_text, templateVars)

    // Final HTML processing
    let htmlBody = emailBody
        .replace(/\n/g, '<br>')
        .replace(/€/g, '&euro;')
        // Ensure links are clickable if they look like URLs and aren't already in tags
        .replace(/(https?:\/\/[^\s<]+)/g, (url) => {
            return `<a href="${url}" style="color: #059669; font-weight: 600; text-decoration: underline;">${url}</a>`
        })

    const { data: siteSettings } = await adminClient
        .from('site_settings')
        .select('logo_url')
        .eq('scope_type', 'group')
        .eq('scope_id', group.id)
        .maybeSingle()
    const logoUrl = group.logo_url || siteSettings?.logo_url
    if (logoUrl) {
        htmlBody = `<img src="${logoUrl}" style="max-height: 60px; margin-bottom: 20px;" /><br/>${htmlBody}`
    }

    await sendEmail({
        from: `${group.name} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
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
