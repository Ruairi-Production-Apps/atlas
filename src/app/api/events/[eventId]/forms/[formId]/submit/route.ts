import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ eventId: string; formId: string }> }
) {
    const { eventId, formId } = await params
    const supabase = await createClient()

    // Optional: Check if user is authenticated (but we might allow anon submissions)
    // For now, let's try getting the user to link the submission to them if potential
    const { data: { user } } = await supabase.auth.getUser()

    try {
        const body = await request.json()
        const { submission_data } = body

        if (!submission_data) {
            return NextResponse.json({ error: 'Missing submission data' }, { status: 400 })
        }

        // Verify form exists
        const { data: form } = await supabase
            .from('event_forms')
            .select('id')
            .eq('id', formId)
            .eq('event_id', eventId)
            .single()

        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 })
        }

        // Insert submission
        const { data: submission, error } = await supabase
            .from('form_submissions')
            .insert({
                form_id: formId,
                user_id: user?.id || null, // Link to user if logged in
                submission_data
            })
            .select()
            .single()

        if (error) {
            console.error('Submission insert error:', error)
            throw error
        }

        return NextResponse.json({ success: true, submission })

    } catch (error: any) {
        console.error('Error submitting form:', error)
        return NextResponse.json({ error: error.message || 'Failed to submit form' }, { status: 500 })
    }
}
