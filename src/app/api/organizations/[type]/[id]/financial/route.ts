import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

        return NextResponse.json(data || {})
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

