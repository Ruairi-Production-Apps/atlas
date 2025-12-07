import { createClient } from '@/lib/supabase/server'

export interface UserWithRoles {
    id: string
    email: string | null
    full_name: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
    roles: Array<{
        id: string
        user_id: string
        role: 'sysadmin' | 'provincial_admin' | 'county_admin' | 'group_leader' | 'section_leader'
        scope_type: 'system' | 'province' | 'county' | 'group' | 'section'
        scope_id: string | null
        created_at: string
        updated_at: string
    }>
}

export async function getAllUsers(): Promise<UserWithRoles[]> {
    const supabase = await createClient()
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    // Get all user roles
    const userIds = profiles?.map(p => p.id) || []
    if (userIds.length === 0) return []

    const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds)

    if (rolesError) throw rolesError

    // Combine profiles with roles
    return (profiles || []).map(profile => ({
        ...profile,
        roles: (userRoles || []).filter(ur => ur.user_id === profile.id),
    }))
}

export async function getAdminOrganizations(userId: string) {
    const supabase = await createClient()
    
    // Get user's admin roles
    const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .in('role', ['sysadmin', 'provincial_admin', 'county_admin', 'group_leader'])

    if (error) throw error
    if (!roles || roles.length === 0) return []

    // Fetch organization names
    const organizations = []
    for (const role of roles) {
        if (role.scope_type === 'province' && role.scope_id) {
            const { data: province } = await supabase
                .from('provinces')
                .select('id, name')
                .eq('id', role.scope_id)
                .single()
            if (province) {
                organizations.push({ type: 'province' as const, id: province.id, name: province.name })
            }
        } else if (role.scope_type === 'county' && role.scope_id) {
            const { data: county } = await supabase
                .from('counties')
                .select('id, name')
                .eq('id', role.scope_id)
                .single()
            if (county) {
                organizations.push({ type: 'county' as const, id: county.id, name: county.name })
            }
        } else if (role.scope_type === 'group' && role.scope_id) {
            const { data: group } = await supabase
                .from('groups')
                .select('id, name')
                .eq('id', role.scope_id)
                .single()
            if (group) {
                organizations.push({ type: 'group' as const, id: group.id, name: group.name })
            }
        } else if (role.role === 'sysadmin') {
            organizations.push({ type: 'province' as const, id: 'system', name: 'System Admin' })
        }
    }

    return organizations
}

