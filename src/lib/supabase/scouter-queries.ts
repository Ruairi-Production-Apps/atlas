import { SupabaseClient } from '@supabase/supabase-js'

export interface UserOrganization {
    id: string
    name: string
    slug: string
    description: string | null
    logo_url: string | null
    type: 'province' | 'county' | 'group'
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

    // Get all user roles for organizations (province, county, group)
    const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .in('scope_type', ['province', 'county', 'group'])

    if (rolesError || !roles || roles.length === 0) {
        return []
    }

    const organizations: UserOrganization[] = []

    // Fetch provinces
    const provinceRoles = roles.filter(r => r.scope_type === 'province' && r.scope_id !== null)
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
    const countyRoles = roles.filter(r => r.scope_type === 'county' && r.scope_id !== null)
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
    const groupRoles = roles.filter(r => r.scope_type === 'group' && r.scope_id !== null)
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

    // Sort by type (province, county, group) then by name
    return organizations.sort((a, b) => {
        const typeOrder = { province: 1, county: 2, group: 3 }
        const typeDiff = typeOrder[a.type] - typeOrder[b.type]
        if (typeDiff !== 0) return typeDiff
        return a.name.localeCompare(b.name)
    })
}

