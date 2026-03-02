import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string; formId: string; fieldId: string }> }
) {
    const { fieldId, formId } = await params

    try {
        const supabase = await createClient()
        const body = await request.json()

        const updateData: any = {}

        if (body.field_type !== undefined) updateData.field_type = body.field_type
        if (body.label !== undefined) updateData.label = body.label
        if (body.required !== undefined) updateData.required = body.required
        if (body.display_order !== undefined) updateData.display_order = body.display_order
        if (body.options !== undefined) updateData.options = body.options
        if (body.participants_config !== undefined) updateData.participants_config = body.participants_config
        if (body.validation_rules !== undefined) updateData.validation_rules = body.validation_rules

        const { data: field, error } = await supabase
            .from('product_form_fields')
            .update(updateData)
            .eq('id', fieldId)
            .eq('form_id', formId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(field)
    } catch (error: any) {
        console.error('[API] Error updating field:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update field' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string; formId: string; fieldId: string }> }
) {
    const { fieldId, formId } = await params

    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('product_form_fields')
            .delete()
            .eq('id', fieldId)
            .eq('form_id', formId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[API] Error deleting field:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete field' },
            { status: 500 }
        )
    }
}
