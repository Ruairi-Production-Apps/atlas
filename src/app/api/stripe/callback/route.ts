
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const stateBase64 = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
        return NextResponse.json({ error: `Stripe Error: ${error}` }, { status: 400 })
    }

    if (!code || !stateBase64) {
        return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
    }

    try {
        const state = JSON.parse(Buffer.from(stateBase64, 'base64').toString())
        const { orgType, orgId, userId } = state

        const supabase = await createClient()

        // Verify user is still authenticated (and matches state if using strict security)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.id !== userId) {
            return NextResponse.json({ error: 'Unauthorized or session mismatch' }, { status: 401 })
        }

        // Exchange code for capability
        const response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code,
        })

        const stripeAccountId = response.stripe_user_id

        // Update DB
        const tableName = orgType === 'province' ? 'provinces' :
            orgType === 'county' ? 'counties' :
                orgType === 'team' ? 'adventure_teams' : 'groups'

        const { error: updateError } = await supabase
            .from(tableName)
            .update({
                stripe_account_id: stripeAccountId,
                stripe_charges_enabled: true, // Assuming true after connect, though standard accounts might need KYC
                stripe_details_submitted: true,
            })
            .eq('id', orgId)

        if (updateError) {
            console.error('Failed to update organization with stripe account:', updateError)
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        // Redirect back to organization edit page with financial tab open and success message
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
            || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000')

        return NextResponse.redirect(`${siteUrl}/scouter/organizations/${orgId}/edit?type=${orgType}&tab=financial&stripe_connected=success`)

    } catch (err: any) {
        console.error('Stripe Callback Error:', err)
        return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
    }
}
