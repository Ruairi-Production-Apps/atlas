import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to check permissions (reusable)
async function checkPermissions(supabase: any, userId: string, type: string, id: string) {
    const { checkOrganizationPermission } = await import('@/lib/auth-utils')
    return checkOrganizationPermission(supabase, userId, type, id, 'can_manage_events')
}

// PATCH - Update a form
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string; formId: string }> }
) {
    const { type, id, eventId, formId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkPermissions(supabase, user.id, type, id)
    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const updateData: any = {}

        if (body.title !== undefined) updateData.title = String(body.title)
        if (body.button_text !== undefined) updateData.button_text = String(body.button_text)
        if (body.enabled !== undefined) updateData.enabled = Boolean(body.enabled)

        const { data: updatedForm, error } = await supabase
            .from('event_forms')
            .update(updateData)
            .eq('id', formId)
            .eq('event_id', eventId)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ form: updatedForm, message: 'Form updated successfully' })
    } catch (error: any) {
        console.error('Error updating form:', error)
        return NextResponse.json({ error: error.message || 'Failed to update form' }, { status: 500 })
    }
}

// DELETE - Delete a form
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string; formId: string }> }
) {
    const { type, id, eventId, formId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkPermissions(supabase, user.id, type, id)
    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const { error } = await supabase
            .from('event_forms')
            .delete()
            .eq('id', formId)
            .eq('event_id', eventId)

        if (error) {
            throw error
        }

        return NextResponse.json({ message: 'Form deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting form:', error)
        return NextResponse.json({ error: error.message || 'Failed to delete form' }, { status: 500 })
    }
}

