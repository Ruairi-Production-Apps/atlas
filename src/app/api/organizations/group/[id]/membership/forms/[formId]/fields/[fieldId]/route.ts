import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH - Update a specific field
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; formId: string; fieldId: string }> }
) {
    const { formId, fieldId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data: updatedField, error } = await supabase
        .from('membership_form_fields')
        .update({
            label: body.label,
            required: body.required,
            options: body.options,
            participants_config: body.participants_config,
            validation_rules: body.validation_rules,
            field_type: body.field_type // Normally wouldn't change, but supported
        })
        .eq('id', fieldId)
        .eq('form_id', formId)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ field: updatedField })
}

// DELETE - Remove a specific field
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; formId: string; fieldId: string }> }
) {
    const { formId, fieldId } = await params
    const supabase = await createClient()

    const { error } = await supabase
        .from('membership_form_fields')
        .delete()
        .eq('id', fieldId)
        .eq('form_id', formId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Field deleted successfully' })
}
