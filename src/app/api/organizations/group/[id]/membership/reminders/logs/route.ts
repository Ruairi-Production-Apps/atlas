import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Auth: group leader, scouter, or sysadmin
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

    // Get the config for this group
    const { data: config } = await supabase
        .from('membership_configs')
        .select('id')
        .eq('group_id', groupId)
        .single()

    if (!config) {
        return NextResponse.json({ logs: [] })
    }

    // Fetch logs for this config, ordered by most recent
    const { data: logs, error } = await supabase
        .from('membership_email_logs')
        .select('*, reminder:membership_reminders(subject)')
        .eq('config_id', config.id)
        .order('created_at', { ascending: false })
        .limit(500)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ logs: logs || [] })
}
