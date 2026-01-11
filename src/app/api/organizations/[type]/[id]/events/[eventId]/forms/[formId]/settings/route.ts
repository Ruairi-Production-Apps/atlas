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
            title,
            description,
            button_text,
            capacity_override,
            visibility_override,
            published
        } = body

        // Update form settings
        const { data, error } = await supabase
            .from('event_forms')
            .update({
                title,
                description,
                button_text,
                capacity_override,
                visibility_override,
                published,
                updated_at: new Date().toISOString()
            })
            .eq('id', formId)
            .select()
            .single()

        if (error) {
            console.error('Update form settings error:', error)
            return NextResponse.json(
                { error: 'Failed to update form settings' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, form: data })

    } catch (error) {
        console.error('Form settings update error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
