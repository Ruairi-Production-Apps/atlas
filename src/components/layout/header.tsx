import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './user-menu'
import { ModeToggle } from '@/components/theme-toggle'

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

    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/images/atlas/AtlasLogo.png"
                            alt="Atlas"
                            className="h-12 w-auto object-contain"
                        />
                        <span className="text-2xl font-serif font-bold tracking-tight text-[#1a472a] hidden sm:inline-block">
                            Atlas
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                            Home
                        </Link>
                        <Link href="/provinces" className="text-sm font-medium hover:text-primary transition-colors">
                            Provinces
                        </Link>
                        <Link href="/counties" className="text-sm font-medium hover:text-primary transition-colors">
                            Counties
                        </Link>
                        <Link href="/groups" className="text-sm font-medium hover:text-primary transition-colors">
                            Groups
                        </Link>
                        <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
                            Events
                        </Link>
                        <Link href="/news" className="text-sm font-medium hover:text-primary transition-colors">
                            News
                        </Link>
                        <Link href="/knowledgebase" className="text-sm font-medium hover:text-primary transition-colors">
                            Knowledgebase
                        </Link>
                        <Link href="/account" className="text-sm font-medium hover:text-primary transition-colors">
                            My Account
                        </Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        {user ? (
                            <>
                                <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="text-sm font-medium hover:text-primary transition-colors mr-4">
                                    Dashboard
                                </Link>
                                <Link href="/account" className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                                    {/* You can replace this with an avatar component if desired */}
                                    <span>{user.email?.split('@')[0] ?? 'Account'}</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
