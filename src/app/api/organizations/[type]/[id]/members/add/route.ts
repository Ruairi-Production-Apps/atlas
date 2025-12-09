import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    // Map 'team' to 'adventure_team' for DB
    const dbScopeType = type === 'team' ? 'adventure_team' : type

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Permission check (Sysadmin or Org Admin)
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    if (!hasPermission) {
        // Check for specific org admin role
        let adminRole = null
        if (type === 'group') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'group_leader')
                .eq('scope_type', 'group')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'county') {
            const { data } = await supabase.from('user_roles').select('*').eq('role', 'county_admin').eq('scope_id', id).eq('user_id', user.id).single()
            adminRole = data
        } else if (type === 'province') {
            const { data } = await supabase.from('user_roles').select('*').eq('role', 'provincial_admin').eq('scope_id', id).eq('user_id', user.id).single()
            adminRole = data
        } else if (type === 'team') {
            // Added missing check for Team Admins
            const { data } = await supabase.from('user_roles').select('*').eq('role', 'team_admin').eq('scope_id', id).eq('user_id', user.id).single()
            adminRole = data
        }


        hasPermission = !!adminRole
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role, permissions } = body

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Insert new role
    const { error } = await supabase
        .from('user_roles')
        .insert({
            user_id: userId,
            role: role || 'scouter',
            scope_type: dbScopeType as any,
            scope_id: id,
            permissions: permissions || {}
        })

    if (error) {
        console.error('Error adding member:', error)
        // Check for duplicate
        if (error.code === '23505') {
            return NextResponse.json({ error: 'User is already a member of this organization' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
