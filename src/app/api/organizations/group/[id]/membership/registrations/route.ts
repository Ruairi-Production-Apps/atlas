import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET - List all registrations for a group (Admin only)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    // 1. Auth check - ensure user is admin of this group
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: role } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('scope_id', groupId)
        .eq('scope_type', 'group')
        .in('role', ['group_leader', 'scouter'])
        .maybeSingle()

    if (!role) {
        // Double check if user is a sysadmin
        const { data: isSysadmin } = await supabase.rpc('is_sysadmin', { user_id: user.id })
        if (!isSysadmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    // 2. Get the membership config for this group
    const { data: config } = await supabase
        .from('membership_configs')
        .select('id')
        .eq('group_id', groupId)
        .maybeSingle()

    if (!config) {
        // No membership config yet — return empty list (not an error)
        return NextResponse.json({ registrations: [] })
    }

    // 3. Fetch registrations via config_id
    console.log(`[API] Fetching registrations for config: ${config.id}`)
    const { data: registrations, error } = await supabase
        .from('membership_registrations')
        .select(`
            *,
            parent:profiles!parent_id(email, first_name, last_name),
            payment_schedules:membership_payment_schedules (*)
        `)
        .eq('config_id', config.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error(`[API] Error fetching registrations for group ${groupId}:`, {
            error,
            config_id: config.id
        })
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log(`[API] Found ${registrations?.length || 0} registrations`)

    return NextResponse.json({ registrations: registrations || [] })
}

// PATCH - Update a registration's email
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: role } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('scope_id', groupId)
        .eq('scope_type', 'group')
        .in('role', ['group_leader', 'scouter'])
        .maybeSingle()

    if (!role) {
        const { data: isSysadmin } = await supabase.rpc('is_sysadmin', { user_id: user.id })
        if (!isSysadmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    const { registrationId, email, field } = await request.json()
    if (!registrationId) {
        return NextResponse.json({ error: 'registrationId is required' }, { status: 400 })
    }

    const emailField = field === 'parent_2_email' ? 'parent_2_email' : 'parent_email'

    // parent_email is required, parent_2_email can be empty (to clear it)
    if (emailField === 'parent_email' && !email) {
        return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Fetch current registration to merge submission_data
    const { data: reg } = await adminClient
        .from('membership_registrations')
        .select('id, submission_data')
        .eq('id', registrationId)
        .single()

    if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })

    const updatedSubmissionData = { ...(reg.submission_data || {}), [emailField]: email || '' }

    const { error } = await adminClient
        .from('membership_registrations')
        .update({ submission_data: updatedSubmissionData })
        .eq('id', registrationId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
}

// DELETE - Remove a registration and its payment schedules
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: role } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('scope_id', groupId)
        .eq('scope_type', 'group')
        .in('role', ['group_leader', 'scouter'])
        .maybeSingle()

    if (!role) {
        const { data: isSysadmin } = await supabase.rpc('is_sysadmin', { user_id: user.id })
        if (!isSysadmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    const body = await request.json()
    const { registrationId } = body

    if (!registrationId) {
        return NextResponse.json({ error: 'registrationId is required' }, { status: 400 })
    }

    // Verify registration belongs to this group's config
    const { data: config } = await supabase
        .from('membership_configs')
        .select('id')
        .eq('group_id', groupId)
        .single()

    if (!config) {
        return NextResponse.json({ error: 'No membership config found' }, { status: 404 })
    }

    const { data: reg } = await supabase
        .from('membership_registrations')
        .select('id')
        .eq('id', registrationId)
        .eq('config_id', config.id)
        .single()

    if (!reg) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Use admin client to bypass RLS for deletion
    const adminClient = createAdminClient()

    // Delete payment schedules first, then registration
    const { error: schedulesError } = await adminClient
        .from('membership_payment_schedules')
        .delete()
        .eq('registration_id', registrationId)

    if (schedulesError) {
        return NextResponse.json({ error: schedulesError.message }, { status: 400 })
    }

    const { error } = await adminClient
        .from('membership_registrations')
        .delete()
        .eq('id', registrationId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
}
