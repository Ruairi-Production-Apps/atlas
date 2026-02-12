import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    // Map 'team' to 'adventure_team' for DB
    const dbScopeType = type === 'team' ? 'adventure_team' : type

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions (sysadmin or group admin)
    let hasPermission = false

    // Use current logic from members route
    const { data: sysadmin } = await supabase.from('user_roles').select('*').eq('user_id', user.id).eq('role', 'sysadmin').single()
    if (sysadmin) hasPermission = true

    if (!hasPermission) {
        const { data: role } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('scope_type', dbScopeType)
            .eq('scope_id', id)
            .in('role', ['provincial_admin', 'county_admin', 'group_leader', 'team_admin'])
            .single()

        if (role) hasPermission = true
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get count of pending requests
    const { count, error } = await supabase
        .from('group_join_requests')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', id)
        .eq('status', 'pending')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ count: count || 0 })
}
