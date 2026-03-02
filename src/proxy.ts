import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import { isHub, isInstance, APP_CONFIG } from './lib/config/app-config'

export async function proxy(request: NextRequest) {
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
        logger.debug('[Middleware] Checking auth...')
        // Use getUser to ensure the session is valid and secure
        const {
            data: { user: supabaseUser },
        } = await supabase.auth.getUser()
        user = supabaseUser || null
        logger.debug('[Middleware] Session check result:', user ? 'Found' : 'Null')
    } catch (error) {
        console.error('[Middleware] Auth error:', error)
        // Proceed as unauthenticated
    }

    const { pathname } = request.nextUrl

    // -------------------------------------------------------------------------
    // 0. App Role Restrictions
    // -------------------------------------------------------------------------
    if (isHub()) {
        // Hub cannot manage memberships or private group data
        const restrictedHubPaths = [
            '/membership',
            '/scouter/organizations',
            '/scouter/site-settings',
            '/api/organizations/group',
            '/signup',
        ]

        if (restrictedHubPaths.some(path => pathname.startsWith(path))) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    if (isInstance()) {
        // 0.1 Initialization Check (Onboarding)
        // If we are not on the setup page, check if we need to redirect there
        if (!pathname.startsWith('/setup') && !pathname.startsWith('/auth') && !pathname.startsWith('/api/auth')) {
            const homeOrgId = APP_CONFIG.homeOrgId;
            const homeOrgType = APP_CONFIG.homeOrgType;

            if (!homeOrgId || !homeOrgType) {
                return NextResponse.redirect(new URL('/setup', request.url));
            }

            // Optional: DB check for is_initialized
            // For performance, we might skip this if the ENV vars are present, 
            // but the user might want a second-stage initialization check.
            const { data: settings } = await supabase
                .from('site_settings')
                .select('is_initialized')
                .eq('scope_type', homeOrgType)
                .eq('scope_id', homeOrgId)
                .maybeSingle();

            if (!settings || !settings.is_initialized) {
                return NextResponse.redirect(new URL('/setup', request.url));
            }
        }

        // Instance mode might want to restrict absolute directory browsing if meant for Hub
        const restrictedInstancePaths = [
            '/provinces',
            '/counties',
        ]

        if (restrictedInstancePaths.some(path => pathname.startsWith(path))) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Protect admin routes - only authenticated users can access
    if (pathname.startsWith('/admin')) {
        if (!user) {
            const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
            // Copy cookies from supabaseResponse
            supabaseResponse.cookies.getAll().forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, {
                    ...cookie,
                    sameSite: 'lax',
                })
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
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    // Only rate limit auth endpoints
    if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
        // Placeholder for future Redis-based rate limiting
    }

    // -------------------------------------------------------------------------
    // 2. CSRF Protection
    // -------------------------------------------------------------------------
    // Validate CSRF token for all state-changing API routes
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks') && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/sync/ingest')) {
        const method = request.method
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const csrfToken = request.headers.get('x-atlas-csrf')
            const secret = process.env.ATLAS_CSRF_SECRET || process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN

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
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://vercel.live;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' blob: data: https://*.supabase.co https://ucarecdn.com;
        connect-src 'self' https://*.supabase.co https://api.vercel.com https://vercel.live https://*.sentry.io;
        frame-src https://js.stripe.com https://*.supabase.co https://vercel.live;
        object-src 'self' blob: data: https://*.supabase.co;
        base-uri 'self';
    `.replace(/\s{2,}/g, ' ').trim()

    supabaseResponse.headers.set('Content-Security-Policy', cspHeader)

    // -------------------------------------------------------------------------
    // 4. Session Timeout (Inactivity)
    // -------------------------------------------------------------------------
    if (user && !pathname.startsWith('/auth/signout')) {
        const lastActive = request.cookies.get('last_active')?.value
        const now = Date.now()
        const MAX_INACTIVITY = 30 * 60 * 1000 // 30 minutes

        if (lastActive) {
            const lastActiveTime = parseInt(lastActive, 10)
            if (now - lastActiveTime > MAX_INACTIVITY) {
                logger.info('[Middleware] Session timed out due to inactivity')
                const response = NextResponse.redirect(new URL('/auth/signout?reason=timeout', request.url))
                response.cookies.delete('last_active')
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
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
