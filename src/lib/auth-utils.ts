import { SupabaseClient } from '@supabase/supabase-js'

export async function checkOrganizationPermission(
    supabase: SupabaseClient,
    userId: string,
    organizationType: string,
    organizationId: string,
    requiredPermission?: string
): Promise<boolean> {
    try {
        // 1. Check for sysadmin role
        const { data: sysadminRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'sysadmin')
            .maybeSingle()

        if (sysadminRole) return true

        // 2. Check for specific organizational admin role
        let role = null
        if (organizationType === 'province') {
            role = 'provincial_admin'
        } else if (organizationType === 'county') {
            role = 'county_admin'
        } else if (organizationType === 'group') {
            role = 'group_leader'
        }

        if (role) {
            const { data: adminRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .eq('role', role)
                .eq('scope_type', organizationType)
                .eq('scope_id', organizationId)
                .maybeSingle()

            if (adminRole) return true
        }

        // 3. Check organization_members with specific permission
        if (requiredPermission) {
            const { data: member } = await supabase
                .from('organization_members')
                .select(requiredPermission)
                .eq('user_id', userId)
                .eq('organization_type', organizationType)
                .eq('organization_id', organizationId)
                .eq(requiredPermission, true)
                .maybeSingle()

            if (member) return true
        }

        return false
    } catch (error) {
        console.error('Error checking permissions:', error)
        return false
    }
}
