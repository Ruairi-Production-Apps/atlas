import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string; formId: string }> }
) {
    const { formId } = await params

    try {
        const supabase = await createClient()

        const { data: form, error } = await supabase
            .from('product_forms')
            .select('*')
            .eq('id', formId)
            .single()

        if (error) throw error

        return NextResponse.json(form)
    } catch (error: any) {
        console.error('[API] Error fetching product form:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch form' },
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

        const updateData: any = {}

        // Only update provided fields
        if (body.title !== undefined) updateData.title = body.title
        if (body.description !== undefined) updateData.description = body.description
        if (body.form_type !== undefined) updateData.form_type = body.form_type

        // Capacity
        if (body.capacity_mode !== undefined) updateData.capacity_mode = body.capacity_mode
        if (body.capacity_total !== undefined) updateData.capacity_total = body.capacity_total
        if (body.capacity_scouters !== undefined) updateData.capacity_scouters = body.capacity_scouters
        if (body.capacity_youth !== undefined) updateData.capacity_youth = body.capacity_youth

        // Date selection
        if (body.enable_date_selection !== undefined) updateData.enable_date_selection = body.enable_date_selection
        if (body.available_dates !== undefined) updateData.available_dates = body.available_dates

        // Pricing
        if (body.pricing_mode !== undefined) updateData.pricing_mode = body.pricing_mode
        if (body.price_base !== undefined) updateData.price_base = body.price_base
        if (body.price_per_youth !== undefined) updateData.price_per_youth = body.price_per_youth
        if (body.price_per_scouter !== undefined) updateData.price_per_scouter = body.price_per_scouter
        if (body.price_per_adult !== undefined) updateData.price_per_adult = body.price_per_adult

        if (body.published !== undefined) updateData.published = body.published

        const { data: form, error } = await supabase
            .from('product_forms')
            .update(updateData)
            .eq('id', formId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(form)
    } catch (error: any) {
        console.error('[API] Error updating product form:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update form' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string; formId: string }> }
) {
    const { formId } = await params

    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('product_forms')
            .delete()
            .eq('id', formId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[API] Error deleting product form:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete form' },
            { status: 500 }
        )
    }
}
