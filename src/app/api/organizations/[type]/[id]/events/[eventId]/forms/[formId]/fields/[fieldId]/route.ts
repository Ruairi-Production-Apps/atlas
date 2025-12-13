import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to check permissions
async function checkPermissions(supabase: any, userId: string, type: string, id: string) {
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    if (!hasPermission) {
        let adminRole = null
        if (type === 'province') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', userId)
                .eq('role', 'provincial_admin')
                .eq('scope_type', 'province')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'county') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', userId)
                .eq('role', 'county_admin')
                .eq('scope_type', 'county')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'group') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', userId)
                .eq('role', 'group_leader')
                .eq('scope_type', 'group')
                .eq('scope_id', id)
                .single()
            adminRole = data
        }
        hasPermission = !!adminRole

        if (!hasPermission) {
            const { data: member } = await supabase
                .from('organization_members')
                .select('*')
                .eq('user_id', userId)
                .eq('organization_type', type)
                .eq('organization_id', id)
                .eq('can_manage_events', true)
                .single()
            hasPermission = !!member
        }
    }

    return hasPermission
}

// PATCH - Update a field
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string; formId: string; fieldId: string }> }
) {
    const { type, id, eventId, formId, fieldId } = await params
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

        if (body.label !== undefined) updateData.label = String(body.label)
        if (body.required !== undefined) updateData.required = Boolean(body.required)
        if (body.options !== undefined) updateData.options = body.options
        if (body.participants_config !== undefined) updateData.participants_config = body.participants_config
        if (body.validation_rules !== undefined) updateData.validation_rules = body.validation_rules
        if (body.number_config !== undefined) updateData.number_config = body.number_config
        if (body.date_config !== undefined) updateData.date_config = body.date_config

        const { data: updatedField, error } = await supabase
            .from('form_fields')
            .update(updateData)
            .eq('id', fieldId)
            .eq('form_id', formId)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ field: updatedField, message: 'Field updated successfully' })
    } catch (error: any) {
        console.error('Error updating field:', error)
        return NextResponse.json({ error: error.message || 'Failed to update field' }, { status: 500 })
    }
}

// DELETE - Delete a field
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string; formId: string; fieldId: string }> }
) {
    const { type, id, eventId, formId, fieldId } = await params
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
            .from('form_fields')
            .delete()
            .eq('id', fieldId)
            .eq('form_id', formId)

        if (error) {
            throw error
        }

        return NextResponse.json({ message: 'Field deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting field:', error)
        return NextResponse.json({ error: error.message || 'Failed to delete field' }, { status: 500 })
    }
}

