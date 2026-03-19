'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSiteSettings(
    settingsId: string,
    data: {
        site_title?: string | null
        logo_url?: string | null
        primary_color?: string | null
        sync_enabled?: boolean
    }
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // For simplicity in this specialized function, we rely on the caller or just check sysadmin
    // In a real app, we'd check if they have permission for the specific org linked to this settingsId
    const { data: sysRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .maybeSingle()

    // Also allow if they are the admin for the org. 
    // Fetching the org from site_settings first
    const { data: settings } = await supabase
        .from('site_settings')
        .select('scope_id')
        .eq('id', settingsId)
        .single()

    const { data: orgRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('scope_id', settings?.scope_id)
        .maybeSingle()

    if (!sysRole && !orgRole) throw new Error("Unauthorized: Insufficient permissions")

    const { error } = await supabase
        .from('site_settings')
        .update(data)
        .eq('id', settingsId)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/scouter/site-settings')
    return { success: true }
}

export async function updateAboutPageContent(settingsId: string, content: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('site_settings')
        .update({ about_page_content: content })
        .eq('id', settingsId)

    if (error) throw error

    revalidatePath('/about')
    revalidatePath('/scouter/site-settings')
    return { success: true }
}

export async function updateHomepageConfig(settingsId: string, config: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('site_settings')
        .update({ homepage_config: config })
        .eq('id', settingsId)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/scouter/site-settings')
    return { success: true }
}
