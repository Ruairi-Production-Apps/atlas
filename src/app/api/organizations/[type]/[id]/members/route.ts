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

    // Check permissions (sysadmin or having admin role/permission for this org)
    // Simplified check: Sysadmin or role in this scope that Is Not just 'scouter' without admin permissions?
    // Let's use existing role check for now for safety.
    let hasPermission = false

    // Check sysadmin
    const { data: sysadmin } = await supabase.from('user_roles').select('*').eq('user_id', user.id).eq('role', 'sysadmin').single()
    if (sysadmin) hasPermission = true

    if (!hasPermission) {
        // Check org admin roles
        const { data: role } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('scope_type', type)
            .eq('scope_id', id)
            .in('role', ['provincial_admin', 'county_admin', 'group_leader', 'team_admin'])
            // Note: 'scouter' with admin permission should conceptually be allowed too, 
            // but for now let's stick to explicit roles for managing members.
            .single()

        if (role) hasPermission = true
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get members from user_roles
    const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('scope_type', type)
        .eq('scope_id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!roles || roles.length === 0) {
        return NextResponse.json({ members: [] })
    }

    const userIds = roles.map(r => r.user_id)

    // Fetch profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds)

    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    // Fetch section names if group
    let sectionMap = new Map()
    if (type === 'group') {
        // Collect section IDs from permissions
        const sectionIds = roles
            .map(r => (r.permissions as any)?.section_id)
            .filter(Boolean)

        if (sectionIds.length > 0) {
            const { data: sections } = await supabase
                .from('sections')
                .select('id, name')
                .in('id', sectionIds)

            if (sections) {
                sectionMap = new Map(sections.map(s => [s.id, s.name]))
            }
        }
    }

    const membersWithDetails = roles.map(role => {
        const profile = profileMap.get(role.user_id)
        const permissions = (role.permissions as any) || {}

        // Ensure defaults
        const defaultPermissions = {
            org_details: false,
            news: false,
            events: false,
            financial: false,
            store: false,
            admin: false,
            ...permissions
        }

        return {
            id: role.id, // This is the Role ID (PK of user_roles)
            user_id: role.user_id,
            user_email: profile?.email || null,
            user_name: (profile?.first_name && profile?.last_name)
                ? `${profile.first_name} ${profile.last_name}`
                : profile?.email || null,
            permissions: defaultPermissions,
            role: role.role,
            section_name: permissions.section_id ? sectionMap.get(permissions.section_id) : null
        }
    })

    return NextResponse.json({ members: membersWithDetails })
}
