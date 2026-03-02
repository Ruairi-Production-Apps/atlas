import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List all fields for a membership form
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; formId: string }> }
) {
    const { id: groupId, formId } = await params
    const supabase = await createClient()

    const { data: fields, error } = await supabase
        .from('membership_form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('display_order', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ fields: fields || [] })
}

// POST - Create a new field for a membership form
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string; formId: string }> }
) {
    const { id: groupId, formId } = await params
    const supabase = await createClient()
    const body = await request.json()

    // Get the highest display_order for this form
    const { data: existingFields } = await supabase
        .from('membership_form_fields')
        .select('display_order')
        .eq('form_id', formId)
        .order('display_order', { ascending: false })
        .limit(1)

    const displayOrder = existingFields && existingFields.length > 0
        ? (existingFields[0].display_order || 0) + 1
        : 0

    const { data: newField, error } = await supabase
        .from('membership_form_fields')
        .insert({
            form_id: formId,
            field_type: body.field_type,
            label: body.label,
            required: body.required || false,
            display_order: displayOrder,
            options: body.options || [],
            participants_config: body.participants_config || {},
            validation_rules: body.validation_rules || {}
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ field: newField })
}

// PATCH - Update field order (for drag and drop)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; formId: string }> }
) {
    const { id: groupId, formId } = await params
    const supabase = await createClient()
    const body = await request.json()
    const { field_orders } = body

    if (!Array.isArray(field_orders)) {
        return NextResponse.json({ error: 'field_orders must be an array' }, { status: 400 })
    }

    const updates = field_orders.map(({ id, display_order }: { id: string; display_order: number }) =>
        supabase
            .from('membership_form_fields')
            .update({ display_order })
            .eq('id', id)
            .eq('form_id', formId)
    )

    await Promise.all(updates)

    return NextResponse.json({ message: 'Field order updated successfully' })
}
