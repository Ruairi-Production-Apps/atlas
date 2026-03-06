import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') || (type === 'recovery' ? '/reset-password' : '/')
    const error = requestUrl.searchParams.get('error')
    const errorCode = requestUrl.searchParams.get('error_code')
    const errorDescription = requestUrl.searchParams.get('error_description')

    // Handle error from Supabase (e.g., expired link)
    if (error) {
        const redirectUrl = new URL(type === 'recovery' ? '/forgot-password' : '/', requestUrl.origin)
        if (error) redirectUrl.searchParams.set('error', error)
        if (errorCode) redirectUrl.searchParams.set('error_code', errorCode)
        if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription)
        return redirect(redirectUrl.toString())
    }

    if (code) {
        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
            return redirect(`/login?error=${encodeURIComponent(exchangeError.message)}`)
        }

        // Redirect is handled by the 'next' param at the end of this function
    }

    // Redirect to the requested page or home
    redirect(next)
}
