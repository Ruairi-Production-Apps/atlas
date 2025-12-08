import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Create initial sysadmin user
// This is a one-time setup route
export async function POST(request: Request) {
    const body = await request.json()
    const { email, password, full_name } = body

    if (!email || !password) {
        return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400 }
        )
    }

    const firstName = full_name?.split(' ')[0] || 'System'
    const lastName = full_name?.split(' ').slice(1).join(' ') || 'Administrator'

    try {
        // Create user using admin client
        const adminClient = createAdminClient()
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for initial setup
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
            },
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }

        // Create sysadmin role
        const supabase = await createClient()
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
                user_id: authData.user.id,
                role: 'sysadmin',
                scope_type: 'system',
                scope_id: null,
            })

        if (roleError) {
            // Rollback: delete the auth user if role creation fails
            await adminClient.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: roleError.message }, { status: 500 })
        }

        return NextResponse.json({
            message: 'Sysadmin user created successfully',
            user: {
                id: authData.user.id,
                email: authData.user.email,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create sysadmin' },
            { status: 500 }
        )
    }
}

