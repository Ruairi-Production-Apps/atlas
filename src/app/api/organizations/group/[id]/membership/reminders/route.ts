import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List reminders for a group's membership config
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Auth check
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

    // Get config for this group
    const { data: config } = await supabase
        .from('membership_configs')
        .select('id')
        .eq('group_id', groupId)
        .maybeSingle()

    if (!config) {
        return NextResponse.json({ reminders: [] })
    }

    const { data: reminders, error } = await supabase
        .from('membership_reminders')
        .select('*')
        .eq('config_id', config.id)
        .order('created_at', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ reminders: reminders || [], configId: config.id })
}

// POST - Create or update a reminder
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Auth check
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

    // Get or create config
    let { data: config } = await supabase
        .from('membership_configs')
        .select('id')
        .eq('group_id', groupId)
        .maybeSingle()

    if (!config) {
        const { data: newConfig, error: configError } = await supabase
            .from('membership_configs')
            .insert({
                group_id: groupId,
                intro_text: '',
                published: false,
            })
            .select('id')
            .single()

        if (configError || !newConfig) {
            return NextResponse.json({ error: 'Failed to create config' }, { status: 500 })
        }
        config = newConfig
    }

    const reminderData = {
        config_id: config.id,
        subject: body.subject,
        body_text: body.body_text,
        send_to_both_parents: body.send_to_both_parents || false,
        frequency_rules: body.frequency_rules || {},
        active: body.active ?? true,
    }

    if (body.id) {
        // Update existing
        const { data: reminder, error } = await supabase
            .from('membership_reminders')
            .update(reminderData)
            .eq('id', body.id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ reminder })
    } else {
        // Create new
        const { data: reminder, error } = await supabase
            .from('membership_reminders')
            .insert(reminderData)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ reminder })
    }
}

// DELETE - Delete a reminder
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const reminderId = searchParams.get('reminderId')

    if (!reminderId) {
        return NextResponse.json({ error: 'reminderId is required' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Auth check
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

    const { error } = await supabase
        .from('membership_reminders')
        .delete()
        .eq('id', reminderId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
}
