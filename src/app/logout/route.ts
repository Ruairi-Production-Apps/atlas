import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function logout(request: Request) {
    const supabase = await createClient()

    // Server-side sign out
    await supabase.auth.signOut()

    // Create a redirect response to the home page
    const response = NextResponse.redirect(new URL('/', request.url))

    // Explicitly delete cookies to ensure client state is clean
    // This prevents "AuthSessionMissingError" on subsequent loads
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    response.cookies.delete('sb-session') // Some adapters use this name

    // Also clear our custom last_active cookie
    response.cookies.delete('last_active')

    return response
}

export async function POST(request: Request) {
    return logout(request)
}

export async function GET(request: Request) {
    return logout(request)
}

