
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH - Update member permissions
// DELETE - Remove member
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; memberId: string }> }
) {
    const { type, id, memberId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check admin permissions
    // (Simplified logic reuse: ideally generic middleware or helper)
    let hasPermission = false
    const { data: sysadmin } = await supabase.from('user_roles').select('*').eq('user_id', user.id).eq('role', 'sysadmin').single()
    if (sysadmin) hasPermission = true
    else {
        const { data: role } = await supabase.from('user_roles').select('*').eq('user_id', user.id).eq('scope_type', type).eq('scope_id', id).in('role', ['provincial_admin', 'county_admin', 'group_leader', 'team_admin']).single()
        if (role) hasPermission = true
    }

    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { permissions } = body

    // Update using memberId which is the PK of user_roles
    const { error } = await supabase
        .from('user_roles')
        .update({ permissions })
        .eq('id', memberId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; memberId: string }> }
) {
    const { type, id, memberId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let hasPermission = false
    const { data: sysadmin } = await supabase.from('user_roles').select('*').eq('user_id', user.id).eq('role', 'sysadmin').single()
    if (sysadmin) hasPermission = true
    else {
        const { data: role } = await supabase.from('user_roles').select('*').eq('user_id', user.id).eq('scope_type', type).eq('scope_id', id).in('role', ['provincial_admin', 'county_admin', 'group_leader', 'team_admin']).single()
        if (role) hasPermission = true
    }

    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Delete using the PK
    const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', memberId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
}
