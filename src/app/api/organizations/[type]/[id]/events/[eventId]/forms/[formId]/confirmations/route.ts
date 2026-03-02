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
            confirmation_message,
            send_confirmation_email,
            send_admin_notification,
            redirect_url
        } = body

        // Validate redirect URL if provided
        if (redirect_url) {
            try {
                new URL(redirect_url)
            } catch {
                return NextResponse.json(
                    { error: 'Invalid redirect URL' },
                    { status: 400 }
                )
            }
        }

        // Update form confirmation settings
        const { data, error } = await supabase
            .from('event_forms')
            .update({
                confirmation_message,
                send_confirmation_email,
                send_admin_notification,
                redirect_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', formId)
            .select()
            .single()

        if (error) {
            console.error('Update form confirmations error:', error)
            return NextResponse.json(
                { error: 'Failed to update confirmation settings' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, form: data })

    } catch (error) {
        console.error('Form confirmations update error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
