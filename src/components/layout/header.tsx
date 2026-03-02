import { createClient } from '@/lib/supabase/server'
import { NavigationBar } from './navigation-bar'
import { getGroupById, getSiteSettings } from '@/lib/supabase/queries'
import { isHub, isInstance, APP_CONFIG } from '@/lib/config/app-config'

export async function Header() {
    let user = null
    let isAdmin = false
    let branding = undefined

    try {
        // Safe check for env vars first
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Supabase env vars missing. Rendering guest header.')
            return <NavigationBar user={null} isAdmin={false} />
        }

        const supabase = await createClient()

        // Fetch branding if in instance mode
        const isInstanceApp = isInstance()
        const homeOrgId = APP_CONFIG.homeOrgId
        const homeOrgType = APP_CONFIG.homeOrgType
        if (isInstanceApp && homeOrgId && homeOrgType) {
            const settings = await getSiteSettings(homeOrgType, homeOrgId)
            if (settings) {
                branding = {
                    siteTitle: settings.site_title,
                    logoUrl: settings.logo_url
                }
            }
        }

        try {
            // Attempt to fetch user
            const { data, error } = await supabase.auth.getUser()

            if (error) {
                // This is expected when not logged in
            } else if (data?.user) {
                user = data.user
                // Check admin role
                try {
                    const { data: roles } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', user.id)
                        .eq('role', 'sysadmin')
                        .single()
                    isAdmin = !!roles
                } catch {
                    // Ignore role check errors
                }
            }
        } catch (authError) {
            // Swallow "AuthSessionMissingError" and other auth/network issues
        }

    } catch (e) {
        // Final safety net for client creation or other unexpected errors
        console.error('[Header] Unexpected error:', e)
    }

    // Always render something
    const isHubApp = isHub()
    return <NavigationBar user={user} isAdmin={isAdmin} branding={branding} isHub={isHubApp} />
}
