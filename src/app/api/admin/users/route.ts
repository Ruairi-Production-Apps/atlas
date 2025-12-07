import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET - List all users
export async function GET() {
    const supabase = await createClient()
    
    // Check if user is sysadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check sysadmin role
    const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    if (!roles) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all users with their profiles and roles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (profilesError) {
        return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    // Get roles for each user
    const userIds = profiles?.map(p => p.id) || []
    const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds)

    if (rolesError) {
        return NextResponse.json({ error: rolesError.message }, { status: 500 })
    }

    // Combine profiles with roles
    const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: userRoles?.filter(ur => ur.user_id === profile.id) || [],
    }))

    return NextResponse.json({ users: usersWithRoles || [] })
}

// POST - Create new user
export async function POST(request: Request) {
    const supabase = await createClient()
    
    // Check if user is sysadmin
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', adminUser.id)
        .eq('role', 'sysadmin')
        .single()

    if (!roles) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, full_name, role, scope_type, scope_id, skip_email_verification } = body

    if (!email || !password || !role || !scope_type) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        )
    }

    // Create user in Supabase Auth using admin client
    const adminClient = createAdminClient()
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: skip_email_verification || false,
        user_metadata: {
            full_name,
        },
    })

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Create user role
    const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
            user_id: authData.user.id,
            role,
            scope_type,
            scope_id: scope_id || null,
        })

    if (roleError) {
        // Rollback: delete the auth user if role creation fails
        const adminClient = createAdminClient()
        await adminClient.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json({ error: roleError.message }, { status: 500 })
    }

    return NextResponse.json({
        user: authData.user,
        message: 'User created successfully',
    })
}

