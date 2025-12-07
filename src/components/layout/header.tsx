import { createClient } from '@/lib/supabase/server'
import { NavigationBar } from './navigation-bar'

export async function Header() {
    let user = null
    let isAdmin = false

    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables not set. Header will render without user authentication.')
    } else {
        try {
            // Wrap in try-catch to handle any fetch errors from Supabase
            const supabase = await createClient()

            try {
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

                if (authError) {
                    // Only log if it's not a network/fetch error or missing session
                    if (authError.message !== 'fetch failed' && authError.message !== 'Auth session missing!') {
                        console.error('Error fetching user:', authError.message)
                    }
                } else {
                    user = authUser

                    if (user) {
                        try {
                            const { data: roles } = await supabase
                                .from('user_roles')
                                .select('*')
                                .eq('user_id', user.id)
                                .eq('role', 'sysadmin')
                                .single()
                            isAdmin = !!roles
                        } catch (error) {
                            // Silently fail - user might not have roles set up yet
                            // Don't log fetch errors
                            if (error && typeof error === 'object' && 'message' in error && error.message !== 'fetch failed') {
                                console.error('Error checking admin status:', error)
                            }
                        }
                    }
                }
            } catch (fetchError: any) {
                // Catch fetch errors specifically
                if (fetchError?.message !== 'fetch failed') {
                    console.error('Error in auth getUser:', fetchError?.message || fetchError)
                }
            }
        } catch (error: any) {
            // Catch any errors from createClient or other operations
            // Don't log fetch failed errors as they're expected in some scenarios
            if (error?.message !== 'fetch failed') {
                console.error('Error in header:', error?.message || error)
            }
        }
    }

    return <NavigationBar user={user} isAdmin={isAdmin} />
}
