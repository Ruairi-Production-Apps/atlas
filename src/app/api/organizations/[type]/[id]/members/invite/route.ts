import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// POST - Invite user to organization
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
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
    const { email } = body

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    if (!existingUser) {
        return NextResponse.json({ error: 'User not found. They must sign up first.' }, { status: 404 })
    }

    // Check if already a member
    const { data: existingMember } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', existingUser.id)
        .eq('organization_type', type)
        .eq('organization_id', id)
        .single()

    if (existingMember) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
    }

    // Add as member with no permissions initially
    const { data: member, error } = await supabase
        .from('organization_members')
        .insert({
            user_id: existingUser.id,
            organization_type: type,
            organization_id: id,
            can_manage_news: false,
            can_manage_events: false,
            can_edit_details: false,
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ member, message: 'User added to organization' })
}

