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

    // Standard branding requirements: Enforce Stripe Connect
    if (!group.stripe_account_id) {
        return NextResponse.json({ error: 'Stripe Connect must be linked before sending reminders' }, { status: 400 })
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
                net_fee
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
            const match = reg?.config_id === config.id
            if (!match && reg) {
                skipReasons.push({
                    scheduleId: s.id,
                    reason: 'Config ID mismatch',
                    scheduleConfigId: reg.config_id,
                    reminderConfigId: config.id
                })
            } else if (!reg) {
                skipReasons.push({
                    scheduleId: s.id,
                    reason: 'Missing registration data'
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

    let sentCount = 0
    const results: any[] = []
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://scouthub.ie'

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

        const host = request.headers.get('host')
        const protocol = host?.includes('localhost') ? 'http' : 'https'
        const siteUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'https://atlashub.ie')

        const templateVars = {
            parent_name: profileFullName,
            parent_first_name: parentFirstName,
            child_names: childNames,
            group_name: group.name,
            amount_due: `€${parseFloat(schedule.amount).toFixed(2)}`,
            amount_paid_to_date: `€${amountPaidToDate.toFixed(2)}`,
            total_balance: `€${(parseFloat(registration.net_fee) || parseFloat(registration.total_fee) || 0).toFixed(2)}`,
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
        if (group.logo_url) {
            htmlBody = `<img src="${group.logo_url}" style="max-height: 60px; margin-bottom: 20px;" /><br/>${htmlBody}`
        }

        try {
            const { success, error } = await sendEmail({
                from: `${group.name} <onboarding@resend.dev>`,
                to: parentProfile.email,
                subject: emailSubject,
                html: htmlBody,
            })

            if (success) {
                sentCount++
                results.push({
                    email: parentProfile.email,
                    status: 'sent',
                })
            } else {
                results.push({
                    email: parentProfile.email,
                    status: 'error',
                    error: (error as any)?.message || 'Resend API error',
                    details: error
                })
            }
        } catch (err: any) {
            results.push({
                email: parentProfile.email,
                status: 'error',
                error: err.message,
            })
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
