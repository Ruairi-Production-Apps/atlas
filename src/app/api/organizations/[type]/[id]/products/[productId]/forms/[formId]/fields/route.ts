import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string; formId: string }> }
) {
    const { formId } = await params

    try {
        const supabase = await createClient()

        const { data: fields, error } = await supabase
            .from('product_form_fields')
            .select('*')
            .eq('form_id', formId)
            .order('display_order', { ascending: true })

        if (error) throw error

        return NextResponse.json(fields)
    } catch (error: any) {
        console.error('[API] Error fetching form fields:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch fields' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string; formId: string }> }
) {
    const { formId } = await params

    try {
        const supabase = await createClient()
        const body = await request.json()

        if (!body.field_type || !body.label) {
            return NextResponse.json(
                { error: 'field_type and label are required' },
                { status: 400 }
            )
        }

        const insertData = {
            form_id: formId,
            field_type: body.field_type,
            label: body.label,
            required: body.required || false,
            display_order: body.display_order || 0,
            options: body.options || [],
            participants_config: body.participants_config || {},
            validation_rules: body.validation_rules || {},
        }

        const { data: field, error } = await supabase
            .from('product_form_fields')
            .insert(insertData)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(field, { status: 201 })
    } catch (error: any) {
        console.error('[API] Error creating form field:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create field' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string; formId: string }> }
) {
    const { formId } = await params

    try {
        const supabase = await createClient()
        const body = await request.json()

        // Batch update field order
        if (body.fields && Array.isArray(body.fields)) {
            const updates = body.fields.map((field: any) => ({
                id: field.id,
                display_order: field.display_order,
            }))

            for (const update of updates) {
                await supabase
                    .from('product_form_fields')
                    .update({ display_order: update.display_order })
                    .eq('id', update.id)
                    .eq('form_id', formId)
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    } catch (error: any) {
        console.error('[API] Error updating fields:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update fields' },
            { status: 500 }
        )
    }
}
