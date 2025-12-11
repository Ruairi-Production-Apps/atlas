import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH - Update an event
export async function PATCH(
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

    // Check if user is sysadmin OR admin of this organization OR has can_manage_events permission
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    if (!hasPermission) {
        let adminRole = null
        if (type === 'province') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'provincial_admin')
                .eq('scope_type', 'province')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'county') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'county_admin')
                .eq('scope_type', 'county')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'group') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
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
                .eq('user_id', user.id)
                .eq('organization_type', type)
                .eq('organization_id', id)
                .eq('can_manage_events', true)
                .single()
            hasPermission = !!member
        }
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const {
            title,
            featured_image_url,
            body: eventBody,
            tags,
            start_date,
            end_date,
            location,
            price,
            capacity_groups,
            capacity_scouters,
            capacity_youth,
            visibility,
            pricing_mode,
            price_scouter,
            price_youth,
            require_participant_info,
            require_payment,
            payment_method,
            category,
            selected_section_types,
            published,
            google_map_link,
        } = body

        const updateData: any = {
            title,
            featured_image_url: featured_image_url || null,
            body: eventBody || null,
            tags: tags || [],
            start_date,
            end_date: end_date || null,
            location: location || null,
            visibility: visibility || 'open_to_all',
            pricing_mode: require_payment ? (pricing_mode || 'per_scout') : null,
            require_participant_info: require_participant_info || false,
            require_payment: require_payment || false,
            payment_method: require_payment ? (payment_method || null) : null,
            category: category || null,
            selected_section_types: visibility === 'sections_only' ? (selected_section_types || []) : [],
            google_map_link: google_map_link || null,
        }

        // Handle pricing based on mode (only if payment is required)
        if (require_payment) {
            if (pricing_mode === 'per_group' || pricing_mode === 'per_scout') {
                updateData.price = price ? parseFloat(price) : null
                updateData.price_scouter = null
                updateData.price_youth = null
            } else if (pricing_mode === 'per_person_type') {
                updateData.price = null
                updateData.price_scouter = price_scouter ? parseFloat(price_scouter) : null
                updateData.price_youth = price_youth ? parseFloat(price_youth) : null
            }
        } else {
            // Clear pricing if payment is not required
            updateData.price = null
            updateData.price_scouter = null
            updateData.price_youth = null
        }

        // Handle capacity
        updateData.capacity_groups = capacity_groups ? parseInt(capacity_groups) : null
        updateData.capacity_scouters = capacity_scouters ? parseInt(capacity_scouters) : null
        updateData.capacity_youth = capacity_youth ? parseInt(capacity_youth) : null

        // Handle published status change
        if (typeof published === 'boolean') {
            const { data: currentEvent } = await supabase
                .from('events')
                .select('published')
                .eq('id', eventId)
                .single()

            if (currentEvent && currentEvent.published === false && published === true) {
                updateData.published_at = new Date().toISOString()
            }
            updateData.published = published
        }

        const { data: updatedEvent, error } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', eventId)
            .eq('scope_type', type)
            .eq('scope_id', id)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ event: updatedEvent, message: 'Event updated successfully' })
    } catch (error: any) {
        console.error('Error updating event:', error)
        return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 })
    }
}

// DELETE - Soft delete an event
export async function DELETE(
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

    // Check if user is sysadmin OR admin of this organization OR has can_manage_events permission
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    if (!hasPermission) {
        let adminRole = null
        if (type === 'province') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'provincial_admin')
                .eq('scope_type', 'province')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'county') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'county_admin')
                .eq('scope_type', 'county')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'group') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
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
                .eq('user_id', user.id)
                .eq('organization_type', type)
                .eq('organization_id', id)
                .eq('can_manage_events', true)
                .single()
            hasPermission = !!member
        }
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const now = new Date().toISOString()
        const { error } = await supabase
            .from('events')
            .update({ deleted_at: now })
            .eq('id', eventId)
            .eq('scope_type', type)
            .eq('scope_id', id)

        if (error) {
            throw error
        }

        return NextResponse.json({ message: 'Event soft-deleted successfully' })
    } catch (error: any) {
        console.error('Error soft-deleting event:', error)
        return NextResponse.json({ error: error.message || 'Failed to soft-delete event' }, { status: 500 })
    }
}

