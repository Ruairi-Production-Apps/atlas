import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Update organization admins
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
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
    const { user_ids, role } = body

    if (!Array.isArray(user_ids) || !role) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Get current admins for this organization
    const { data: currentAdmins } = await supabase
        .from('user_roles')
        .select('*')
        .eq('scope_type', type)
        .eq('scope_id', id)

    const currentAdminIds = currentAdmins?.map(a => a.user_id) || []
    const newAdminIds = new Set(user_ids)

    // Remove admins that are no longer selected
    const toRemove = currentAdminIds.filter(id => !newAdminIds.has(id))
    for (const userId of toRemove) {
        await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('scope_type', type)
            .eq('scope_id', id)
    }

    // Add new admins
    const toAdd = user_ids.filter((id: string) => !currentAdminIds.includes(id))
    for (const userId of toAdd) {
        // Check if user already has this role for this scope
        const { data: existing } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId)
            .eq('role', role)
            .eq('scope_type', type)
            .eq('scope_id', id)
            .single()

        if (!existing) {
            await supabase
                .from('user_roles')
                .insert({
                    user_id: userId,
                    role,
                    scope_type: type,
                    scope_id: id,
                })
        }
    }

    return NextResponse.json({ message: 'Admins updated successfully' })
}

