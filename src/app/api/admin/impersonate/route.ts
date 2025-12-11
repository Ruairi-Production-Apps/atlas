import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'
import { ImpersonateSchema } from '@/lib/schemas'
import { handleApiError, notFoundResponse } from '@/lib/api-utils'

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
        .maybeSingle()

    if (!roles) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const validated = ImpersonateSchema.parse(body)
        const target_user_id = validated.target_user_id

        // Verify target user exists
        const adminClient = createAdminClient()
        const { data: targetUser, error: userError } = await adminClient.auth.admin.getUserById(target_user_id)

        if (userError || !targetUser) {
            return notFoundResponse('Target user not found')
        }

        // Create a signed JWT for impersonation
        const secret = new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY!)
        const token = await new SignJWT({
            admin_id: adminUser.id,
            target_id: target_user_id
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret)

        // Store signed token in a httpOnly cookie
        const cookieStore = await cookies()
        cookieStore.set('impersonation_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        })

        // Remove old insecure cookies if they exist
        cookieStore.delete('impersonate_admin_id')
        cookieStore.delete('impersonate_user_id')

        return NextResponse.json({
            message: 'Impersonation started',
            target_user_id,
        })
    } catch (e) {
        return handleApiError(e)
    }
}
