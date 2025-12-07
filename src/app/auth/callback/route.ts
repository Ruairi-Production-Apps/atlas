import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
        const supabase = await createClient()
        await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to the requested page or home
    redirect(next)
}

