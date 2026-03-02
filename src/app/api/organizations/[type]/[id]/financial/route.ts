import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// GET - Get financial data for an organization
// GET - Get financial data for an organization
export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is sysadmin OR admin of this organization
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    if (!hasPermission) {
        let adminRole = null
        if (type === 'province') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'provincial_admin')
                .eq('scope_type', 'province')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'county') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'county_admin')
                .eq('scope_type', 'county')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'group') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'group_leader')
                .eq('scope_type', 'group')
                .eq('scope_id', id)
                .single()
            adminRole = data
        }
        hasPermission = !!adminRole
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const tableName = type === 'province' ? 'provinces' : type === 'county' ? 'counties' : type === 'team' ? 'adventure_teams' : 'groups'
        const { data, error } = await supabase
            .from(tableName as any)
            .select('iban, bic, account_name, stripe_account_id, stripe_charges_enabled, stripe_details_submitted')
            .eq('id', id)
            .single()

        if (error) {
            throw error
        }

        const result: any = data || {}

        // Fetch additional Stripe account details if connected
        if (result.stripe_account_id) {
            try {
                const account = await stripe.accounts.retrieve(result.stripe_account_id)
                result.stripe_account_name = account.business_profile?.name
                    || account.settings?.dashboard?.display_name
                    || (account as any).business_name
                    || null
                result.stripe_account_email = account.email || null
                result.stripe_livemode = !!(account as any).charges_enabled // livemode is on the account object
                // The account object's `charges_enabled` is the real source of truth
                result.stripe_charges_enabled = account.charges_enabled
                result.stripe_payouts_enabled = account.payouts_enabled
                result.stripe_details_submitted = account.details_submitted
                // Determine environment: test accounts have IDs starting with acct_ and
                // we can check if our platform key is test mode
                result.stripe_is_test = result.stripe_account_id.startsWith('acct_') &&
                    (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') || false)
            } catch (stripeErr: any) {
                console.error('Failed to fetch Stripe account details:', stripeErr.message)
                // Don't fail the whole request — just return what we have from DB
                result.stripe_fetch_error = 'Unable to retrieve account details from Stripe'
            }
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error fetching financial data:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch financial data' }, { status: 500 })
    }
}

// PATCH - Update financial data for an organization
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is sysadmin OR admin of this organization
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    if (!hasPermission) {
        let adminRole = null
        if (type === 'province') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'provincial_admin')
                .eq('scope_type', 'province')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'county') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'county_admin')
                .eq('scope_type', 'county')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'group') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'group_leader')
                .eq('scope_type', 'group')
                .eq('scope_id', id)
                .single()
            adminRole = data
        }
        hasPermission = !!adminRole
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { iban, bic, account_name } = body

        const tableName = type === 'province' ? 'provinces' : type === 'county' ? 'counties' : type === 'team' ? 'adventure_teams' : 'groups'

        const updateData: any = {}
        if (iban !== undefined) updateData.iban = iban || null
        if (bic !== undefined) updateData.bic = bic || null
        if (account_name !== undefined) updateData.account_name = account_name || null
        // Stripe keys are no longer updated manually

        const { data, error } = await supabase
            .from(tableName as any)
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ data, message: 'Financial data updated successfully' })
    } catch (error: any) {
        console.error('Error updating financial data:', error)
        return NextResponse.json({ error: error.message || 'Failed to update financial data' }, { status: 500 })
    }
}

