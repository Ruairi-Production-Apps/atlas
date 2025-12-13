import { createClient } from '@/lib/supabase/server'
import { NavigationBar } from './navigation-bar'

export async function Header() {
    let user = null
    let isAdmin = false

    try {
        // Safe check for env vars first
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Supabase env vars missing. Rendering guest header.')
            return <NavigationBar user={null} isAdmin={false} />
        }

        const supabase = await createClient()

        try {
            // Attempt to fetch user
            // We await this explicitly to catch the "AuthSessionMissingError"
            const { data, error } = await supabase.auth.getUser()

            if (error) {
                // This is expected when not logged in
                // console.log('[Header] No session found (guest)')
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
            // This ensures the header renders as guest instead of crashing the page
            // console.warn('[Header] Auth check failed:', authError)
        }

    } catch (e) {
        // Final safety net for client creation or other unexpected errors
        console.error('[Header] Unexpected error:', e)
    }

    // Always render something
    return <NavigationBar user={user} isAdmin={isAdmin} />
}
