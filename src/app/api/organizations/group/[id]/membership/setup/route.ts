import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Retrieve membership configuration for a group
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Auth check - ensure user is admin of this group
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

    // 2. Get config
    const { data: config, error: configError } = await supabase
        .from('membership_configs')
        .select(`
            *,
            membership_fee_items (*)
        `)
        .eq('group_id', groupId)
        .maybeSingle()

    if (configError) {
        // If it's a "table doesn't exist" error, give a helpful message
        if (configError.code === 'PGRST204') {
            return NextResponse.json({
                error: 'Membership tables not found. Please ensure database migrations have been applied.'
            }, { status: 500 })
        }
        return NextResponse.json({ error: configError.message }, { status: 400 })
    }

    // Get form
    let { data: form, error: formError } = await supabase
        .from('membership_forms')
        .select('*')
        .eq('group_id', groupId)
        .single()

    if (formError && formError.code === 'PGRST116') {
        // Create default form if not found
        const { data: newForm, error: createError } = await supabase
            .from('membership_forms')
            .insert({
                group_id: groupId,
                title: 'Membership Intake Form',
                description: 'Please complete this form to register your child for the upcoming scouting year.',
                button_text: 'Register Member'
            })
            .select()
            .single()

        if (!createError) {
            form = newForm
        }
    }

    return NextResponse.json({
        config: config || null,
        form: form || null
    })
}

// POST/PATCH - Create or update membership configuration
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Auth check - ensure user is admin of this group
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

    const { fee_items, membership_fee_items, ...configData } = body

    // Ensure group_id is set
    configData.group_id = groupId

    // Use upsert for config
    const { data: config, error: configError } = await supabase
        .from('membership_configs')
        .upsert(configData)
        .select()
        .single()

    if (configError) {
        return NextResponse.json({ error: configError.message }, { status: 400 })
    }

    // Handle fee items if provided
    if (fee_items && Array.isArray(fee_items)) {
        // Simple approach: delete existing and re-insert
        // A more robust approach would be to differential update
        await supabase
            .from('membership_fee_items')
            .delete()
            .eq('config_id', config.id)

        const itemsToInsert = fee_items.map((item: any) => ({
            ...item,
            config_id: config.id
        }))

        const { error: itemsError } = await supabase
            .from('membership_fee_items')
            .insert(itemsToInsert)

        if (itemsError) {
            return NextResponse.json({ error: itemsError.message }, { status: 400 })
        }
    }

    return NextResponse.json({ config, message: 'Settings saved successfully' })
}
