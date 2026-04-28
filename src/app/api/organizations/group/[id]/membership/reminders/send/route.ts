import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { createClient as createServerClient } from '@/lib/supabase/server'
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

// POST - Manually send a specific reminder to all applicable recipients
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createServerClient()
    const body = await request.json()
    const reminderId = body.reminderId

    if (!reminderId) {
        return NextResponse.json({ error: 'reminderId is required' }, { status: 400 })
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: role } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('scope_id', groupId)
        .eq('scope_type', 'group')
        .in('role', ['group_leader', 'scouter'])
        .maybeSingle()

    if (!role) {
        const { data: isSysadmin } = await supabase.rpc('is_sysadmin', { user_id: user.id })
        if (!isSysadmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    // Use service role for data access (bypass RLS for sending emails)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch the reminder with config and group info
    const { data: reminder, error: reminderError } = await supabaseAdmin
        .from('membership_reminders')
        .select(`
            *,
            config:membership_configs (
                id,
                group_id,
                group:groups (
                    id,
                    name,
                    logo_url,
                    stripe_account_id
                )
            )
        `)
        .eq('id', reminderId)
        .single()

    if (reminderError || !reminder) {
        return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    const config = reminder.config as any
    const group = config?.group as any

    if (!config || !group) {
        return NextResponse.json({ error: 'Missing membership configuration or group details' }, { status: 400 })
    }

    // Verify the reminder belongs to this group
    if (config.group_id !== groupId) {
        return NextResponse.json({ error: 'Reminder does not belong to this group' }, { status: 403 })
    }

    // Note: stripe_account_id is optional — groups can use platform Stripe keys directly

    // -------------------------------------------------------------------------
    // Single-registration path: send to one specific recipient
    // -------------------------------------------------------------------------
    const registrationId = body.registrationId
    if (registrationId) {
        const { data: registration } = await supabaseAdmin
            .from('membership_registrations')
            .select('*, payment_schedules:membership_payment_schedules(*)')
            .eq('id', registrationId)
            .single()

        if (!registration) {
            return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
        }

        const parentId = registration.parent_id
        const { data: parentProfile } = await supabaseAdmin
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', parentId)
            .single()

        const recipientEmail = registration.submission_data?.parent_email || parentProfile?.email
        if (!recipientEmail) {
            return NextResponse.json({ error: 'No email address found for this registration' }, { status: 400 })
        }

        const pendingSchedules = (registration.payment_schedules || [])
            .filter((s: any) => s.status === 'pending')
            .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

        const schedule = pendingSchedules[0]

        const { data: paidSchedules } = await supabaseAdmin
            .from('membership_payment_schedules')
            .select('amount')
            .eq('registration_id', registrationId)
            .eq('status', 'paid')

        const amountPaidToDate = (paidSchedules || []).reduce(
            (sum: number, s: any) => sum + parseFloat(s.amount), 0
        )

        const magicLinkToken = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        await supabaseAdmin
            .from('membership_registrations')
            .update({ magic_link_token: magicLinkToken, magic_link_expires_at: expiresAt })
            .eq('id', registrationId)

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (() => { const h = request.headers.get('host'); return h?.includes('localhost') ? `http://${h}` : h ? `https://${h}` : 'https://atlashub.ie'; })()

        const children = registration.submission_data?.children || []
        const childNames = children.map((c: any) => c.name).join(', ')
        const profileFullName = `${parentProfile?.first_name || ''} ${parentProfile?.last_name || ''}`.trim()
        const parentName = registration.submission_data?.parent_name || profileFullName || 'there'
        const parentFirstName = registration.submission_data?.parent_first_name || parentProfile?.first_name || 'there'

        const templateVars = {
            parent_name: parentName,
            parent_first_name: parentFirstName,
            child_names: childNames,
            group_name: group.name,
            amount_due: `€${Math.max(0, (parseFloat(registration.net_fee) || parseFloat(registration.total_fee) || 0) - amountPaidToDate).toFixed(2)}`,
            amount_paid_to_date: `€${amountPaidToDate.toFixed(2)}`,
            total_balance: `€${Math.max(0, (parseFloat(registration.net_fee) || parseFloat(registration.total_fee) || 0) - amountPaidToDate).toFixed(2)}`,
            due_date: schedule ? new Date(schedule.due_date).toLocaleDateString('en-IE') : '',
            dashboard_link: `${siteUrl}/dashboard`,
            payment_link: `${siteUrl}/membership/pay/${magicLinkToken}`,
        }

        const emailSubject = replaceTemplateVariables(reminder.subject, templateVars)
        let emailBody = replaceTemplateVariables(reminder.body_text, templateVars)
        let htmlBody = emailBody
            .replace(/\n/g, '<br>')
            .replace(/€/g, '&euro;')
            .replace(/(https?:\/\/[^\s<]+)/g, (url) => {
                return `<a href="${url}" style="color: #059669; font-weight: 600; text-decoration: underline;">${url}</a>`
            })

        const { data: siteSettings } = await supabaseAdmin
            .from('site_settings')
            .select('logo_url')
            .eq('scope_type', 'group')
            .eq('scope_id', groupId)
            .maybeSingle()
        const logoUrl = group.logo_url || siteSettings?.logo_url
        if (logoUrl) {
            htmlBody = `<img src="${logoUrl}" style="max-height: 60px; margin-bottom: 20px;" /><br/>${htmlBody}`
        }

        // Build list of recipients (parent 1, and optionally parent 2)
        const recipients = [recipientEmail]
        const parent2Email = registration.submission_data?.parent_2_email
        if (reminder.send_to_both_parents && parent2Email) {
            recipients.push(parent2Email)
        }

        let sentCount = 0
        for (const toEmail of recipients) {
            const { success, error: sendError } = await sendEmail({
                from: `${group.name} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: toEmail,
                subject: emailSubject,
                html: htmlBody,
            })

            await supabaseAdmin.from('membership_email_logs').insert({
                reminder_id: reminderId,
                config_id: config.id,
                trigger_type: 'manual',
                recipient_email: toEmail,
                recipient_name: parentName,
                subject: emailSubject,
                status: success ? 'sent' : 'error',
                error_message: success ? null : (sendError as any)?.message,
            })

            if (success) sentCount++
        }

        if (sentCount === 0) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({ message: `Email sent to ${sentCount} recipient(s)`, sent: sentCount })
    }

    // Find all pending payment schedules for this group's registrations
    const { data: schedules, error: schedulesError } = await supabaseAdmin
        .from('membership_payment_schedules')
        .select(`
        *,
            registration: membership_registrations(
                id,
                config_id,
                parent_id,
                submission_data,
                total_fee,
                net_fee,
                payment_status
            )
                `)
        .eq('status', 'pending')

    if (schedulesError) {
        console.error(`[SendNow] Schedules fetch error: `, schedulesError)
        return NextResponse.json({
            error: 'Failed to fetch schedules',
            details: schedulesError,
            sent: 0
        }, { status: 500 })
    }

    if (!schedules || schedules.length === 0) {
        return NextResponse.json({
            message: 'No pending schedules found in the system',
            sent: 0,
            diagnostics: {
                total_schedules_found: 0,
                config_id_searching_for: config.id
            }
        })
    }

    // List of reasons for skipping to help debug
    const skipReasons: any[] = []

    // Filter to only schedules belonging to this reminder's config
    // and normalize registration to always be an object
    const relevantSchedules = (schedules || [])
        .map((s: any) => ({
            ...s,
            registration: Array.isArray(s.registration) ? s.registration[0] : s.registration
        }))
        .filter((s: any) => {
            const reg = s.registration
            if (!reg) {
                skipReasons.push({ scheduleId: s.id, reason: 'Missing registration data' })
                return false
            }
            if (reg.payment_status === 'paid') {
                skipReasons.push({ scheduleId: s.id, reason: 'Registration already paid' })
                return false
            }
            const match = reg.config_id === config.id
            if (!match) {
                skipReasons.push({
                    scheduleId: s.id,
                    reason: 'Config ID mismatch',
                    scheduleConfigId: reg.config_id,
                    reminderConfigId: config.id
                })
            }
            return match
        })

    const buildDiagnostics = () => ({
        total_pending_schedules_in_system: schedules?.length || 0,
        config_id_searching_for: config.id,
        relevant_schedules_count: relevantSchedules.length,
        skip_reasons: skipReasons.slice(0, 20),
        sample_schedules: (schedules || []).slice(0, 3).map(s => ({
            id: s.id,
            reg_config_id: Array.isArray(s.registration) ? s.registration[0]?.config_id : s.registration?.config_id
        }))
    })

    if (relevantSchedules.length === 0) {
        return NextResponse.json({
            message: 'No registrations with pending payments found for this specific reminder config',
            sent: 0,
            diagnostics: buildDiagnostics()
        })
    }

    // Deduplicate by parent — send one email per parent with earliest due schedule
    const parentScheduleMap = new Map<string, any>()
    for (const schedule of relevantSchedules) {
        const parentId = schedule.registration?.parent_id
        if (!parentId) {
            console.log(`[SendNow] Schedule ${schedule.id} has no parent_id on registration ${schedule.registration?.id}`)
            continue
        }
        if (!parentScheduleMap.has(parentId) ||
            new Date(schedule.due_date) < new Date(parentScheduleMap.get(parentId).due_date)) {
            parentScheduleMap.set(parentId, schedule)
        }
    }

    // If skipAlreadySent flag is set, fetch today's successful sends and skip them
    const skipAlreadySent = body.skipAlreadySent === true
    let alreadySentEmails = new Set<string>()
    if (skipAlreadySent) {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const { data: todayLogs } = await supabaseAdmin
            .from('membership_email_logs')
            .select('recipient_email')
            .eq('reminder_id', reminderId)
            .eq('status', 'sent')
            .gte('created_at', todayStart.toISOString())
        alreadySentEmails = new Set((todayLogs || []).map(l => l.recipient_email.toLowerCase()))
    }

    let sentCount = 0
    const results: any[] = []
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlashub.ie'

    for (const [parentId, schedule] of parentScheduleMap) {
        const registration = schedule.registration as any

        // Get parent profile
        const { data: parentProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', parentId)
            .single()

        if (profileError || !parentProfile) {
            results.push({
                parentId,
                status: 'error',
                message: `Profile not found or column mismatch: ${profileError?.message || 'Unknown'} `
            })
            continue
        }

        // Skip if already sent today
        if (skipAlreadySent && alreadySentEmails.has(parentProfile.email.toLowerCase())) {
            results.push({ parentId, email: parentProfile.email, status: 'skipped', message: 'Already sent today' })
            continue
        }

        if (!parentProfile?.email) {
            results.push({
                parentId,
                email: 'none',
                status: 'error',
                message: 'No email address found in profile'
            })
            continue
        }

        // Build template variables
        const children = registration.submission_data?.children || []
        const childNames = children.map((c: any) => c.name).join(', ')
        const profileFullName = `${parentProfile.first_name || ''} ${parentProfile.last_name || ''} `.trim()
        const parentName = registration.submission_data?.parent_name || profileFullName || 'there'
        const parentFirstName = registration.submission_data?.parent_first_name || parentProfile.first_name || 'there'

        const { data: paidSchedules } = await supabaseAdmin
            .from('membership_payment_schedules')
            .select('amount')
            .eq('registration_id', registration.id)
            .eq('status', 'paid')

        const amountPaidToDate = (paidSchedules || []).reduce(
            (sum: number, s: any) => sum + parseFloat(s.amount), 0
        )

        // Generate/Rotate Magic Link Token
        const magicLinkToken = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now

        await supabaseAdmin
            .from('membership_registrations')
            .update({
                magic_link_token: magicLinkToken,
                magic_link_expires_at: expiresAt
            })
            .eq('id', registration.id)

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (() => { const h = request.headers.get('host'); return h?.includes('localhost') ? `http://${h}` : h ? `https://${h}` : 'https://atlashub.ie'; })()

        const templateVars = {
            parent_name: profileFullName,
            parent_first_name: parentFirstName,
            child_names: childNames,
            group_name: group.name,
            amount_due: `€${Math.max(0, (parseFloat(registration.net_fee) || parseFloat(registration.total_fee) || 0) - amountPaidToDate).toFixed(2)}`,
            amount_paid_to_date: `€${amountPaidToDate.toFixed(2)}`,
            total_balance: `€${Math.max(0, (parseFloat(registration.net_fee) || parseFloat(registration.total_fee) || 0) - amountPaidToDate).toFixed(2)}`,
            due_date: new Date(schedule.due_date).toLocaleDateString('en-IE'),
            dashboard_link: `${siteUrl}/dashboard`,
            payment_link: `${siteUrl}/membership/pay/${magicLinkToken}`,
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

        // Apply branding to body AFTER linkification to avoid wrapping logo URL in <a> tag
        const { data: siteSettings } = await supabaseAdmin
            .from('site_settings')
            .select('logo_url')
            .eq('scope_type', 'group')
            .eq('scope_id', groupId)
            .maybeSingle()
        const logoUrl = group.logo_url || siteSettings?.logo_url
        if (logoUrl) {
            htmlBody = `<img src="${logoUrl}" style="max-height: 60px; margin-bottom: 20px;" /><br/>${htmlBody}`
        }

        // Build recipient list (parent 1 + optional parent 2)
        const bulkRecipients = [parentProfile.email]
        const parent2Email = registration.submission_data?.parent_2_email
        if (reminder.send_to_both_parents && parent2Email) {
            bulkRecipients.push(parent2Email)
        }

        for (const toEmail of bulkRecipients) {
            try {
                const { success, error } = await sendEmail({
                    from: `${group.name} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                    to: toEmail,
                    subject: emailSubject,
                    html: htmlBody,
                })

                if (success) {
                    sentCount++
                    results.push({
                        email: toEmail,
                        status: 'sent',
                    })
                    await supabaseAdmin.from('membership_email_logs').insert({
                        reminder_id: reminderId,
                        config_id: config.id,
                        trigger_type: 'manual',
                        recipient_email: toEmail,
                        recipient_name: templateVars.parent_name,
                        subject: emailSubject,
                        status: 'sent',
                    })
                } else {
                    const errorMsg = (error as any)?.message || 'Resend API error'
                    results.push({
                        email: toEmail,
                        status: 'error',
                        error: errorMsg,
                        details: error
                    })
                    await supabaseAdmin.from('membership_email_logs').insert({
                        reminder_id: reminderId,
                        config_id: config.id,
                        trigger_type: 'manual',
                        recipient_email: toEmail,
                        recipient_name: templateVars.parent_name,
                        subject: emailSubject,
                        status: 'error',
                        error_message: errorMsg,
                    })
                }
            } catch (err: any) {
                results.push({
                    email: toEmail,
                    status: 'error',
                    error: err.message,
                })
                await supabaseAdmin.from('membership_email_logs').insert({
                    reminder_id: reminderId,
                    config_id: config.id,
                    trigger_type: 'manual',
                    recipient_email: toEmail,
                    recipient_name: templateVars.parent_name,
                    subject: emailSubject,
                    status: 'error',
                    error_message: err.message,
                })
            }
        }
    }

    // Update last_run_at
    await supabaseAdmin
        .from('membership_reminders')
        .update({ last_run_at: new Date().toISOString() })
        .eq('id', reminderId)

    return NextResponse.json({
        message: `Sent ${sentCount} emails`,
        sent: sentCount,
        details: results,
        diagnostics: buildDiagnostics()
    })
}
