import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; eventId: string; formId: string }> }
) {
    try {
        const { formId } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            require_payment,
            pricing_model,
            price_youth,
            price_scouter,
            price_group,
            price_fixed,
            payment_notes
        } = body

        // Validate pricing model
        const validModels = ['per_youth', 'per_scouter', 'per_participant', 'per_group', 'fixed_price', 'free']
        if (pricing_model && !validModels.includes(pricing_model)) {
            return NextResponse.json(
                { error: 'Invalid pricing model' },
                { status: 400 }
            )
        }

        // Update form payment settings
        const { data, error } = await supabase
            .from('event_forms')
            .update({
                require_payment,
                pricing_model,
                price_youth,
                price_scouter,
                price_group,
                price_fixed,
                payment_notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', formId)
            .select()
            .single()

        if (error) {
            console.error('Update form payments error:', error)
            return NextResponse.json(
                { error: 'Failed to update payment settings' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, form: data })

    } catch (error) {
        console.error('Form payments update error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
