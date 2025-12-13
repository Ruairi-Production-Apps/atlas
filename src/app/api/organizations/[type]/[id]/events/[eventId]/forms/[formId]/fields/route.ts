import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to check permissions (reusable)
async function checkPermissions(supabase: any, userId: string, type: string, id: string) {
    const { checkOrganizationPermission } = await import('@/lib/auth-utils')
    return checkOrganizationPermission(supabase, userId, type, id, 'can_manage_events')
}

// GET - List all fields for a form
export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string; formId: string }> }
) {
    const { type, id, eventId, formId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkPermissions(supabase, user.id, type, id)
    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        // Verify form belongs to event
        const { data: form } = await supabase
            .from('event_forms')
            .select('*')
            .eq('id', formId)
            .eq('event_id', eventId)
            .single()

        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 })
        }

        const { data: fields, error } = await supabase
            .from('form_fields')
            .select('*')
            .eq('form_id', formId)
            .order('display_order', { ascending: true })

        if (error) {
            throw error
        }

        return NextResponse.json({ fields: fields || [] })
    } catch (error: any) {
        console.error('Error fetching form fields:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch form fields' }, { status: 500 })
    }
}

// POST - Create a new field
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string; formId: string }> }
) {
    const { type, id, eventId, formId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkPermissions(supabase, user.id, type, id)
    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        // Verify form belongs to event
        const { data: form } = await supabase
            .from('event_forms')
            .select('*')
            .eq('id', formId)
            .eq('event_id', eventId)
            .single()

        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 })
        }

        const body = await request.json()
        const { field_type, label, required, options, participants_config, validation_rules, number_config, date_config, address_config, content_config } = body

        if (!field_type || !label) {
            return NextResponse.json({ error: 'Field type and label are required' }, { status: 400 })
        }

        // Get the highest display_order for this form
        const { data: existingFields } = await supabase
            .from('form_fields')
            .select('display_order')
            .eq('form_id', formId)
            .order('display_order', { ascending: false })
            .limit(1)

        const displayOrder = existingFields && existingFields.length > 0
            ? (existingFields[0].display_order || 0) + 1
            : 0

        const insertData: any = {
            form_id: formId,
            field_type: String(field_type),
            label: String(label),
            required: Boolean(required || false),
            display_order: displayOrder,
        }

        if (options !== undefined) {
            insertData.options = options
        }
        if (participants_config !== undefined) {
            insertData.participants_config = participants_config
        }
        if (validation_rules !== undefined) {
            insertData.validation_rules = validation_rules
        }
        if (number_config !== undefined) {
            insertData.number_config = number_config
        }
        if (date_config !== undefined) {
            insertData.date_config = date_config
        }
        if (address_config !== undefined) {
            insertData.address_config = address_config
        }
        if (content_config !== undefined) {
            insertData.content_config = content_config
        }

        const { data: newField, error } = await supabase
            .from('form_fields')
            .insert(insertData)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ field: newField, message: 'Field created successfully' })
    } catch (error: any) {
        console.error('Error creating form field:', error)
        return NextResponse.json({ error: error.message || 'Failed to create form field' }, { status: 500 })
    }
}

// PATCH - Update field order (for drag and drop)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string; formId: string }> }
) {
    const { type, id, eventId, formId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkPermissions(supabase, user.id, type, id)
    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { field_orders } = body // Array of { id, display_order }

        if (!Array.isArray(field_orders)) {
            return NextResponse.json({ error: 'field_orders must be an array' }, { status: 400 })
        }

        // Update all fields in a transaction
        const updates = field_orders.map(({ id, display_order }: { id: string; display_order: number }) =>
            supabase
                .from('form_fields')
                .update({ display_order: Number(display_order) })
                .eq('id', id)
                .eq('form_id', formId)
        )

        await Promise.all(updates)

        return NextResponse.json({ message: 'Field order updated successfully' })
    } catch (error: any) {
        console.error('Error updating field order:', error)
        return NextResponse.json({ error: error.message || 'Failed to update field order' }, { status: 500 })
    }
}

