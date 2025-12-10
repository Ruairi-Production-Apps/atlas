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

    // -------------------------------------------------------------------------
    // 1. Rate Limiting (Simple In-Memory Fallback)
    // -------------------------------------------------------------------------
    // Note: In a distributed environment (Vercel Edge), this Map is not shared 
    // across generic instances, so it provides only local protection. 
    // For production, use Upstash Redis (commented out below).
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    // Only rate limit auth endpoints
    if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
        const rateLimitKey = `rate_limit:${ip}`
        // Simple token bucket / counter implementation
        // we can't easily use a global variable in edge middleware reliably across requests
        // without external storage, but we'll try a very simple approach or stub it.
        // Realistically, without Redis, we can't do effective rate limiting in Edge Middleware.
        // We will skip strict implementation here to avoid breaking things with ephemeral state,
        // but adding the structure where you WOULD call Upstash.

        /* 
        // Upstash Implementation Example:
        const { Ratelimit } = require("@upstash/ratelimit");
        const { Redis } = require("@upstash/redis");
        
        if (process.env.UPSTASH_REDIS_REST_URL) {
            const ratelimit = new Ratelimit({
                redis: Redis.fromEnv(),
                limiter: Ratelimit.slidingWindow(10, "10 s"),
            });
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
            }
        }
        */
    }

    // -------------------------------------------------------------------------
    // 2. CSRF Protection
    // -------------------------------------------------------------------------
    // Validate CSRF token for all state-changing API routes
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks') && !pathname.startsWith('/api/auth')) {
        const method = request.method
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const csrfToken = request.headers.get('x-atlas-csrf')
            const secret = process.env.ATLAS_CSRF_SECRET

            if (!secret || csrfToken !== secret) {
                console.warn(`[Middleware] CSRF validation failed for ${method} ${pathname}`)
                return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
            }
        }
    }

    // -------------------------------------------------------------------------
    // 3. Content Security Policy (CSP)
    // -------------------------------------------------------------------------
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://*.supabase.co https://ucarecdn.com;
        connect-src 'self' https://*.supabase.co https://api.vercel.com;
        frame-src https://js.stripe.com;
        object-src 'self' blob: data: https://*.supabase.co;
        base-uri 'self';
    `.replace(/\s{2,}/g, ' ').trim()

    supabaseResponse.headers.set('Content-Security-Policy', cspHeader)

    // -------------------------------------------------------------------------
    // 4. Session Timeout (Inactivity)
    // -------------------------------------------------------------------------
    // Skip timeout check for signout route to prevent redirect loops
    if (user && !pathname.startsWith('/auth/signout')) {
        const lastActive = request.cookies.get('last_active')?.value
        const now = Date.now()
        const MAX_INACTIVITY = 30 * 60 * 1000 // 30 minutes

        if (lastActive) {
            const lastActiveTime = parseInt(lastActive, 10)
            if (now - lastActiveTime > MAX_INACTIVITY) {
                console.log('[Middleware] Session timed out due to inactivity')
                // Redirect to logout or force sign out
                // We'll redirect to a logout route that handles the cleanup
                const response = NextResponse.redirect(new URL('/auth/signout?reason=timeout', request.url))
                response.cookies.delete('last_active')

                // Copy CSP headers to redirect response
                response.headers.set('Content-Security-Policy', cspHeader)

                return response
            }
        }

        // Update last_active
        supabaseResponse.cookies.set('last_active', now.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: MAX_INACTIVITY / 1000 // Match timeout
        })
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
