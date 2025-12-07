import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST - Start impersonation
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
    const { target_user_id } = body

    if (!target_user_id) {
        return NextResponse.json(
            { error: 'target_user_id is required' },
            { status: 400 }
        )
    }

    // Verify target user exists
    const adminClient = createAdminClient()
    const { data: targetUser, error: userError } = await adminClient.auth.admin.getUserById(target_user_id)
    
    if (userError || !targetUser) {
        return NextResponse.json(
            { error: 'Target user not found' },
            { status: 404 }
        )
    }

    // Store original admin user ID in a cookie
    const cookieStore = await cookies()
    cookieStore.set('impersonate_admin_id', adminUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    })

    // Store target user ID for impersonation
    cookieStore.set('impersonate_user_id', target_user_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    })

    return NextResponse.json({
        message: 'Impersonation started',
        target_user_id,
    })
}

