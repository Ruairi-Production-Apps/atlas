import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    let user = null

    try {
        console.log('[Middleware] Checking auth...')
        // Use getUser to ensure the session is valid and secure
        const {
            data: { user: supabaseUser },
        } = await supabase.auth.getUser()
        user = supabaseUser || null
        console.log('[Middleware] Session check result:', user ? 'Found' : 'Null')
    } catch (error) {
        console.error('[Middleware] Auth error:', error)
        // Proceed as unauthenticated
    }

    const { pathname } = request.nextUrl

    // Protect admin routes - only authenticated users can access
    if (pathname.startsWith('/admin')) {
        if (!user) {
            const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
            // Copy cookies from supabaseResponse
            supabaseResponse.cookies.getAll().forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
            })
            return redirectResponse
        }

        try {
            // Check for sysadmin role
            const { data: sysAdminRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'sysadmin')
                .maybeSingle()

            if (!sysAdminRole) {
                return NextResponse.redirect(new URL('/scouter/dashboard', request.url))
            }
        } catch (error) {
            console.error('Middleware role check error:', error)
            // On role check failure, default to safe redirect
            return NextResponse.redirect(new URL('/scouter/dashboard', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
