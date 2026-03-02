import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

// Use Service Role key for CRON to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface FrequencyRules {
    type: 'before_due' | 'after_due' | 'recurring'
    days_before?: number
    days_after?: number
    repeat_interval_days?: number
    max_reminders?: number
}

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

export async function GET(request: Request) {
    // 1. Auth check - only allow Vercel Cron or specific secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 })
    }

    const now = new Date()
    let sentCount = 0
    const allResults: any[] = []

    // 2. Fetch all active reminders with their config and group info
    const { data: activeReminders, error: remindersError } = await supabaseAdmin
        .from('membership_reminders')
        .select(`
            *,
            config:membership_configs (
                id,
                group_id,
                group:groups (
                    name, 
                    slug,
                    logo_url
                )
            )
        `)
        .eq('active', true)

    if (remindersError || !activeReminders || activeReminders.length === 0) {
        return NextResponse.json({ message: 'No active reminders configured', error: remindersError?.message })
    }

    for (const reminder of activeReminders) {
        const rules: FrequencyRules = reminder.frequency_rules as FrequencyRules
        const config = reminder.config as any
        const group = config?.group

        if (!config || !group) continue

        // 3. Find relevant pending payment schedules based on reminder frequency
        let dueDateFilter: { operator: string; value: string } | null = null

        if (rules.type === 'before_due') {
            const targetDate = new Date(now.getTime() + (rules.days_before || 3) * 24 * 60 * 60 * 1000)
            // Find schedules due within the window
            dueDateFilter = { operator: 'lt', value: targetDate.toISOString() }
        } else if (rules.type === 'after_due') {
            // Find schedules that are already overdue
            dueDateFilter = { operator: 'lt', value: now.toISOString() }
        } else if (rules.type === 'recurring') {
            // Find all pending schedules (overdue)
            dueDateFilter = { operator: 'lt', value: now.toISOString() }
        }

        if (!dueDateFilter) continue

        const { data: schedules } = await supabaseAdmin
            .from('membership_payment_schedules')
            .select(`
                *,
                registration:membership_registrations (
                    id,
                    config_id,
                    parent_id,
                    submission_data,
                    total_fee,
                    net_fee
                )
            `)
            .eq('status', 'pending')
            .lt('due_date', dueDateFilter.value)

        if (!schedules || schedules.length === 0) continue

        // Filter to only schedules belonging to this reminder's config
        const relevantSchedules = schedules.filter((s: any) =>
            s.registration?.config_id === config.id
        )

        for (const schedule of relevantSchedules) {
            const registration = schedule.registration as any
            if (!registration) continue

            // Get parent profile
            const { data: parentProfile } = await supabaseAdmin
                .from('profiles')
                .select('email, first_name, last_name')
                .eq('id', registration.parent_id)
                .single()

            if (!parentProfile?.email) continue

            // Check for duplicate reminders — skip if same reminder+schedule was sent recently
            const dedupeHours = rules.type === 'recurring'
                ? (rules.repeat_interval_days || 7) * 24
                : 24

            // Check actual send log (use a simple approach: check metadata in the reminders table)
            // We'll use the last_run_at field on the reminder itself for basic deduplication
            if (reminder.last_run_at) {
                const lastRun = new Date(reminder.last_run_at)
                const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)
                if (hoursSinceLastRun < dedupeHours) continue
            }

            // Build template variables
            const children = registration.submission_data?.children || []
            const childNames = children.map((c: any) => c.name).join(', ')

            const profileFullName = `${parentProfile.first_name || ''} ${parentProfile.last_name || ''}`.trim()
            const parentName = registration.submission_data?.parent_name || profileFullName || 'there'
            const parentFirstName = registration.submission_data?.parent_first_name || parentProfile.first_name || 'there'

            // Calculate amount paid to date
            const { data: paidSchedules } = await supabaseAdmin
                .from('membership_payment_schedules')
                .select('amount')
                .eq('registration_id', registration.id)
                .eq('status', 'paid')

            const amountPaidToDate = (paidSchedules || []).reduce(
                (sum: number, s: any) => sum + parseFloat(s.amount), 0
            )

            const host = request.headers.get('host')
            const protocol = host?.includes('localhost') ? 'http' : 'https'
            const siteUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'https://atlashub.ie')

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

            const templateVars: Record<string, string> = {
                parent_name: parentName,
                parent_first_name: parentFirstName,
                child_names: childNames || 'your child',
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

            // Send email
            try {
                const { success, error } = await sendEmail({
                    from: `${group.name} <onboarding@resend.dev>`,
                    to: parentProfile.email,
                    subject: emailSubject,
                    html: htmlBody,
                })

                if (success) {
                    sentCount++
                    allResults.push({
                        reminder_id: reminder.id,
                        schedule_id: schedule.id,
                        email: parentProfile.email,
                        status: 'sent'
                    })
                } else {
                    allResults.push({
                        reminder_id: reminder.id,
                        schedule_id: schedule.id,
                        email: parentProfile.email,
                        status: 'error',
                        error: (error as any)?.message || 'Resend API error'
                    })
                }
            } catch (err: any) {
                allResults.push({
                    reminder_id: reminder.id,
                    schedule_id: schedule.id,
                    email: parentProfile.email,
                    status: 'error',
                    error: err.message
                })
            }
        }

        // Update last_run_at on the reminder
        await supabaseAdmin
            .from('membership_reminders')
            .update({ last_run_at: now.toISOString() })
            .eq('id', reminder.id)
    }

    return NextResponse.json({
        message: `Processed ${activeReminders.length} active reminders`,
        sent: sentCount,
        details: allResults
    })
}
