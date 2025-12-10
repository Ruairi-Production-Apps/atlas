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
            // Attempt to fetch user (verifies token, unlike getSession)
            console.log('[Header] Fetching user...')
            const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser()

            if (authError) {
                console.error('[Header] Auth error:', authError)
            } else if (supabaseUser) {
                console.log('[Header] User found:', supabaseUser.id)
                user = supabaseUser
                try {
                    // Check admin role
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
        } catch (fetchError) {
            // Ignore connection errors (e.g. offline, bad config)
            console.warn('Network or Auth error in Header:', fetchError)
        }

    } catch (e) {
        // Final safety net
        console.error('Critical error in Header:', e)
    }

    // Always render something
    return <NavigationBar user={user} isAdmin={isAdmin} />
}
