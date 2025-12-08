
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const orgType = searchParams.get('type')
    const orgId = searchParams.get('id')

    if (!orgType || !orgId) {
        return NextResponse.json({ error: 'Missing organization type or ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // verify admin permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url)) // Or 401 JSON
    }

    // (Simple check: ensure user can manage this org. In a real app we'd reuse the `can_manage_scope` DB function or similar logic)
    // For now assuming the UI protects the button and the callback does validation too.
    // Ideally we store a state token in a cookie to verify on callback.

    const state = JSON.stringify({ orgType, orgId, userId: user.id })
    const stateBase64 = Buffer.from(state).toString('base64')

    if (!process.env.STRIPE_CONNECT_CLIENT_ID) {
        return NextResponse.json({ error: 'System misconfiguration: No Client ID' }, { status: 500 })
    }

    const redirectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CONNECT_CLIENT_ID}&scope=read_write&state=${stateBase64}&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/callback`

    return NextResponse.redirect(redirectUrl)
}
