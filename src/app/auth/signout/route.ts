import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const supabase = await createClient()

    // Sign out from SupabaseAuth
    await supabase.auth.signOut()

    // Redirect to login with a message potentially
    return NextResponse.redirect(new URL('/login?reason=timeout', requestUrl.origin))
}
