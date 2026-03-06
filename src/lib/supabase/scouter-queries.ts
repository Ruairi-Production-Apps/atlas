import { SupabaseClient } from '@supabase/supabase-js'
import { isInstance } from '@/lib/config/app-config'

export interface UserOrganization {
    id: string
    name: string
    slug: string
    description: string | null
    logo_url: string | null
    type: 'province' | 'county' | 'group' | 'adventure_team'
    role: string
    scope_id: string
}

export interface Section {
    id: string
    name: string
    section_type: string
}

export async function getGroupSections(supabase: SupabaseClient, groupId: string): Promise<Section[]> {
    const { data } = await supabase
        .from('sections')
        .select('id, name, section_type')
        .eq('group_id', groupId)
        .order('name')

    return data || []
}

export async function getUserOrganizations(supabase: SupabaseClient): Promise<UserOrganization[]> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    // Get all user roles for organizations
    let query = supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .in('scope_type', ['system', 'province', 'county', 'group', 'adventure_team'])

    const { data: roles, error: rolesError } = await query

    const isInstanceMode = isInstance()
    let roles_list = roles || []

    // In Instance mode, ensure the home org is handled
    if (isInstanceMode) {
        const { data: homeOrgSettings } = await supabase
            .from('site_settings')
            .select('scope_id, scope_type')
            .eq('is_initialized', true)
            .maybeSingle()

        if (homeOrgSettings && homeOrgSettings.scope_id) {
            const hasExplicitRole = roles_list.some(r => r.scope_type === homeOrgSettings.scope_type && r.scope_id === homeOrgSettings.scope_id)
            const isSysadmin = roles_list.some(r => r.role === 'sysadmin')

            if (!hasExplicitRole) {
                // If they are a sysadmin, give them sysadmin access to the home org
                // If not, just give them member access so they see it
                roles_list.push({
                    user_id: user.id,
                    role: isSysadmin ? 'sysadmin' : 'member',
                    scope_type: homeOrgSettings.scope_type,
                    scope_id: homeOrgSettings.scope_id
                })
            }
        }
    }

    if (rolesError || roles_list.length === 0) {
        return []
    }

    const organizations: UserOrganization[] = []
    const processedRoles = roles_list // Use the augmented list

    // Fetch provinces
    const provinceRoles = processedRoles.filter(r => r.scope_type === 'province' && r.scope_id !== null)
    if (provinceRoles.length > 0) {
        const provinceIds = provinceRoles.map(r => r.scope_id).filter((id): id is string => id !== null)
        const { data: provinces } = await supabase
            .from('provinces')
            .select('id, name, slug, description, logo_url')
            .in('id', provinceIds)
            .is('deleted_at', null)

        if (provinces) {
            for (const province of provinces) {
                const role = provinceRoles.find(r => r.scope_id === province.id)
                organizations.push({
                    id: province.id,
                    name: province.name,
                    slug: province.slug,
                    description: province.description,
                    logo_url: province.logo_url,
                    type: 'province',
                    role: role?.role || 'member',
                    scope_id: role?.scope_id || province.id,
                })
            }
        }
    }

    // Fetch counties
    const countyRoles = processedRoles.filter(r => r.scope_type === 'county' && r.scope_id !== null)
    if (countyRoles.length > 0) {
        const countyIds = countyRoles.map(r => r.scope_id).filter((id): id is string => id !== null)
        const { data: counties } = await supabase
            .from('counties')
            .select('id, name, slug, description, logo_url')
            .in('id', countyIds)
            .is('deleted_at', null)

        if (counties) {
            for (const county of counties) {
                const role = countyRoles.find(r => r.scope_id === county.id)
                organizations.push({
                    id: county.id,
                    name: county.name,
                    slug: county.slug,
                    description: county.description,
                    logo_url: county.logo_url,
                    type: 'county',
                    role: role?.role || 'member',
                    scope_id: role?.scope_id || county.id,
                })
            }
        }
    }

    // Fetch groups
    const groupRoles = processedRoles.filter(r => r.scope_type === 'group' && r.scope_id !== null)
    if (groupRoles.length > 0) {
        const groupIds = groupRoles.map(r => r.scope_id).filter((id): id is string => id !== null)
        const { data: groups } = await supabase
            .from('groups')
            .select('id, name, slug, description, logo_url')
            .in('id', groupIds)
            .is('deleted_at', null)

        if (groups) {
            for (const group of groups) {
                const role = groupRoles.find(r => r.scope_id === group.id)
                organizations.push({
                    id: group.id,
                    name: group.name,
                    slug: group.slug,
                    description: group.description,
                    logo_url: group.logo_url,
                    type: 'group',
                    role: role?.role || 'member',
                    scope_id: role?.scope_id || group.id,
                })
            }
        }
    }

    // Fetch adventure teams
    const teamRoles = processedRoles.filter(r => r.scope_type === 'adventure_team' && r.scope_id !== null)
    if (teamRoles.length > 0) {
        const teamIds = teamRoles.map(r => r.scope_id).filter((id): id is string => id !== null)
        const { data: teams } = await supabase
            .from('adventure_teams')
            .select('id, name, slug, description, logo_url')
            .in('id', teamIds)
            .is('deleted_at', null)

        if (teams) {
            for (const team of teams) {
                const role = teamRoles.find(r => r.scope_id === team.id)
                organizations.push({
                    id: team.id,
                    name: team.name,
                    slug: team.slug,
                    description: team.description,
                    logo_url: team.logo_url,
                    type: 'adventure_team',
                    role: role?.role || 'member',
                    scope_id: role?.scope_id || team.id,
                })
            }
        }
    }

    // Sort by type (province, county, group, adventure_team) then by name
    return organizations.sort((a, b) => {
        const typeOrder = { province: 1, county: 2, group: 3, adventure_team: 4 }
        const typeDiff = typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder]
        if (typeDiff !== 0) return typeDiff
        return a.name.localeCompare(b.name)
    })
}


export async function getUserPendingRequests(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data, error } = await supabase
        .from('group_join_requests')
        .select(`
            id,
            status,
            requested_role,
            created_at,
            group:groups(id, name, logo_url)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching pending requests:', error)
        return []
    }

    return data || []
}

export async function getUserSavedEvents(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data, error } = await supabase
        .from('user_saved_events')
        .select(`
            id,
            created_at,
            event:events(id, title, slug, start_date, location)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching saved events:', error)
        return []
    }

    // Map the data to fix the type mismatch (Supabase joins return arrays)
    return (data || []).map((row: any) => ({
        ...row,
        event: Array.isArray(row.event) ? row.event[0] : row.event
    }))
}

