import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// PATCH - Update user
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    
    // Check if user is sysadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    if (!roles) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, full_name, password } = body

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    try {
        const adminClient = createAdminClient()

        // Update user in auth
        const updateData: any = {
            email,
            user_metadata: {
                full_name: full_name || null,
            },
        }

        // Only update password if provided
        if (password) {
            updateData.password = password
        }

        const { data: authData, error: authError } = await adminClient.auth.admin.updateUserById(
            id,
            updateData
        )

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        // Update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                email,
                full_name: full_name || null,
            })
            .eq('id', id)

        if (profileError) {
            console.error('Error updating profile:', profileError)
            // Continue anyway - auth update was successful
        }

        return NextResponse.json({ 
            message: 'User updated successfully',
            user: authData.user,
        })
    } catch (error: any) {
        console.error('Error updating user:', error)
        return NextResponse.json({ 
            error: error.message || 'Failed to update user' 
        }, { status: 500 })
    }
}

