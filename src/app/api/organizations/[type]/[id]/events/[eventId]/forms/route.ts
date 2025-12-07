import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List all forms for an event
export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string }> }
) {
    const { type, id, eventId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const { checkOrganizationPermission } = await import('@/lib/auth-utils')
    const hasPermission = await checkOrganizationPermission(supabase, user.id, type, id, 'can_manage_events')

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const { data: forms, error } = await supabase
            .from('event_forms')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true })

        if (error) {
            throw error
        }

        return NextResponse.json({ forms: forms || [] })
    } catch (error: any) {
        console.error('Error fetching forms:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch forms' }, { status: 500 })
    }
}

// POST - Create a new form
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string }> }
) {
    const { type, id, eventId } = await params
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const { checkOrganizationPermission } = await import('@/lib/auth-utils')
    const hasPermission = await checkOrganizationPermission(supabase, user.id, type, id, 'can_manage_events')

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { form_type, title } = body

        if (!form_type || !title) {
            return NextResponse.json({ error: 'Form type and title are required' }, { status: 400 })
        }

        if (form_type !== 'expression_of_interest' && form_type !== 'registration') {
            return NextResponse.json({ error: 'Invalid form type' }, { status: 400 })
        }

        const { data: newForm, error } = await supabase
            .from('event_forms')
            .insert({
                event_id: eventId,
                form_type,
                title: String(title),
                enabled: true,
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ form: newForm, message: 'Form created successfully' })
    } catch (error: any) {
        console.error('Error creating form:', error)
        return NextResponse.json({ error: error.message || 'Failed to create form' }, { status: 500 })
    }
}

