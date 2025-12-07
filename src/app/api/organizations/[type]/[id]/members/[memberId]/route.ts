import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH - Update member permissions
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; memberId: string }> }
) {
    const { type, id, memberId } = await params
    const supabase = await createClient()

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

    const body = await request.json()

    const { error } = await supabase
        .from('organization_members')
        .update(body)
        .eq('id', memberId)
        .eq('organization_type', type)
        .eq('organization_id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Member updated successfully' })
}

// DELETE - Remove member from organization
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; memberId: string }> }
) {
    const { type, id, memberId } = await params
    const supabase = await createClient()

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

    const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_type', type)
        .eq('organization_id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Member removed successfully' })
}

