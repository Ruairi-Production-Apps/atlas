
import { createClient } from "@/lib/supabase/server"

export async function getUserPermissions(userId: string, scopeType: string, scopeId: string) {
    const supabase = await createClient()

    // Check sysadmin
    const { data: sysadmin } = await supabase.from('user_roles').select('*').eq('user_id', userId).eq('role', 'sysadmin').single()
    if (sysadmin) return { admin: true, org_details: true, news: true, events: true, financial: true, store: true }

    // Get specific role
    const { data: role } = await supabase
        .from('user_roles')
        .select('permissions, role')
        .eq('user_id', userId)
        .eq('scope_type', scopeType)
        .eq('scope_id', scopeId)
        .single()

    if (!role) return null

    // Helper to merge default permissions with JSON
    const perms = (role.permissions as any) || {}

    // Explicit Admin roles override? 
    // If role is group_leader, county_admin, etc., they effectively have admin.
    // We should respect the role enum for backward compatibility / robustness.
    const isAdminRole = ['provincial_admin', 'county_admin', 'group_leader', 'team_admin'].includes(role.role)

    if (isAdminRole || perms.admin) {
        return { admin: true, org_details: true, news: true, events: true, financial: true, store: true, ...perms }
    }

    return {
        admin: false,
        org_details: false,
        news: false,
        events: false,
        financial: false,
        store: false,
        ...perms
    }
}
