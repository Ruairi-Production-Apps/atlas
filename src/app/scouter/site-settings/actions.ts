'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSiteSettings(groupId: string, data: {
    site_title?: string | null
    name?: string
    logo_url?: string | null
    primary_color?: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check permissions (should be group leader or admin)
    const { data: role } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('scope_id', groupId)
        .in('role', ['group_leader', 'county_admin', 'provincial_admin', 'sysadmin'])
        .single()

    if (!role) {
        // Fallback: check if they are a sysadmin globally
        const { data: sysRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'sysadmin')
            .single()
        if (!sysRole) throw new Error("Unauthorized: Insufficient permissions")
    }

    const { error } = await supabase
        .from('groups')
        .update(data)
        .eq('id', groupId)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/scouter/site-settings')
    return { success: true }
}

export async function updateHomepageConfig(groupId: string, config: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check permissions
    const { data: role } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('scope_id', groupId)
        .in('role', ['group_leader', 'county_admin', 'provincial_admin', 'sysadmin'])
        .single()

    if (!role) {
        // Fallback: check if they are a sysadmin globally
        const { data: sysRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'sysadmin')
            .single()
        if (!sysRole) throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from('groups')
        .update({ homepage_config: config })
        .eq('id', groupId)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/scouter/site-settings')
    return { success: true }
}
