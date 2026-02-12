import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string }> }
) {
    const { productId } = await params

    try {
        const supabase = await createClient()

        const { data: forms, error } = await supabase
            .from('product_forms')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(forms)
    } catch (error: any) {
        console.error('[API] Error fetching product forms:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch forms' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string }> }
) {
    const { productId } = await params

    try {
        const supabase = await createClient()
        const body = await request.json()

        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        const insertData = {
            product_id: productId,
            title: body.title,
            description: body.description || null,
            form_type: body.form_type || 'custom',

            // Capacity
            capacity_mode: body.capacity_mode || null,
            capacity_total: body.capacity_total || null,
            capacity_scouters: body.capacity_scouters || null,
            capacity_youth: body.capacity_youth || null,

            // Date selection
            enable_date_selection: body.enable_date_selection || false,
            available_dates: body.available_dates || [],

            // Pricing
            pricing_mode: body.pricing_mode || 'product_default',
            price_base: body.price_base || null,
            price_per_youth: body.price_per_youth || null,
            price_per_scouter: body.price_per_scouter || null,
            price_per_adult: body.price_per_adult || null,

            published: body.published || false,
        }

        const { data: form, error } = await supabase
            .from('product_forms')
            .insert(insertData)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(form, { status: 201 })
    } catch (error: any) {
        console.error('[API] Error creating product form:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create form' },
            { status: 500 }
        )
    }
}
