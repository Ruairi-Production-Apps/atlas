import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List organization members
export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is sysadmin OR admin of this organization
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    if (!hasPermission) {
        let adminRole = null
        if (type === 'province') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'provincial_admin')
                .eq('scope_type', 'province')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'county') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'county_admin')
                .eq('scope_type', 'county')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'group') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'group_leader')
                .eq('scope_type', 'group')
                .eq('scope_id', id)
                .single()
            adminRole = data
        }
        hasPermission = !!adminRole
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get members
    const { data: members, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_type', type)
        .eq('organization_id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get user details for each member
    const userIds = (members || []).map((m: any) => m.user_id)
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    const membersWithDetails = (members || []).map((member: any) => {
        const profile = profileMap.get(member.user_id)
        return {
            id: member.id,
            user_id: member.user_id,
            user_email: profile?.email || null,
            user_name: profile?.full_name || null,
            can_manage_news: member.can_manage_news,
            can_manage_events: member.can_manage_events,
            can_edit_details: member.can_edit_details,
        }
    })

    return NextResponse.json({ members: membersWithDetails })
}

