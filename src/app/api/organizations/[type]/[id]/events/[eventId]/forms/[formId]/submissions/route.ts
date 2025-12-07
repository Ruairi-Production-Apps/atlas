import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string, id: string; eventId: string; formId: string }> }
) {
    const { formId } = await params
    const supabase = await createClient()

    try {
        // Fetch submissions
        const { data: submissions, error: submissionsError } = await supabase
            .from('form_submissions')
            .select('*')
            .eq('form_id', formId)
            .order('created_at', { ascending: false })

        if (submissionsError) throw submissionsError

        // Fetch form fields for headers
        const { data: fields, error: fieldsError } = await supabase
            .from('form_fields')
            .select('id, label, field_type, display_order')
            .eq('form_id', formId)
            .order('display_order', { ascending: true })

        if (fieldsError) throw fieldsError

        return NextResponse.json({ submissions, fields })

    } catch (error: any) {
        console.error('Error fetching submissions:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch submissions' }, { status: 500 })
    }
}
