import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List all registrations for a group (Admin only)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    // 1. Auth check - ensure user is admin of this group
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
        // Double check if user is a sysadmin
        const { data: isSysadmin } = await supabase.rpc('is_sysadmin', { user_id: user.id })
        if (!isSysadmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    // 2. Get the membership config for this group
    const { data: config } = await supabase
        .from('membership_configs')
        .select('id')
        .eq('group_id', groupId)
        .maybeSingle()

    if (!config) {
        // No membership config yet — return empty list (not an error)
        return NextResponse.json({ registrations: [] })
    }

    // 3. Fetch registrations via config_id
    const { data: registrations, error } = await supabase
        .from('membership_registrations')
        .select(`
            *,
            payment_schedules:membership_payment_schedules (*)
        `)
        .eq('config_id', config.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error(`[API] Error fetching registrations for group ${groupId}:`, {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        })
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ registrations: registrations || [] })
}
