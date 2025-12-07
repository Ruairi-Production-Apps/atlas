import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List events for an organization
export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
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
        const { searchParams } = new URL(request.url)
        const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

        let query = supabase
            .from('events')
            .select('*')
            .eq('scope_type', type)
            .eq('scope_id', id)
            .is('deleted_at', null)
            .order('start_date', { ascending: true })

        if (!includeUnpublished) {
            query = query.eq('published', true)
        }

        const { data: events, error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json({ events })
    } catch (error: any) {
        console.error('Error fetching events:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch events' }, { status: 500 })
    }
}

// POST - Create a new event for an organization
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
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
            selected_section_types,
            published,
        } = body

        if (!title || !start_date) {
            return NextResponse.json({ error: 'Title and start date are required' }, { status: 400 })
        }

        const insertData: any = {
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
            selected_section_types: visibility === 'sections_only' ? (selected_section_types || []) : [],
            scope_type: type,
            scope_id: id,
            author_id: user.id,
            published: published || false,
            published_at: published ? new Date().toISOString() : null,
        }

        // Handle pricing based on mode (only if payment is required)
        if (require_payment) {
            if (pricing_mode === 'per_group' || pricing_mode === 'per_scout') {
                insertData.price = price ? parseFloat(price) : null
            } else if (pricing_mode === 'per_person_type') {
                insertData.price_scouter = price_scouter ? parseFloat(price_scouter) : null
                insertData.price_youth = price_youth ? parseFloat(price_youth) : null
            }
        } else {
            // Clear pricing if payment is not required
            insertData.price = null
            insertData.price_scouter = null
            insertData.price_youth = null
        }

        // Handle capacity
        insertData.capacity_groups = capacity_groups ? parseInt(capacity_groups) : null
        insertData.capacity_scouters = capacity_scouters ? parseInt(capacity_scouters) : null
        insertData.capacity_youth = capacity_youth ? parseInt(capacity_youth) : null

        const { data: newEvent, error } = await supabase
            .from('events')
            .insert(insertData)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ event: newEvent, message: 'Event created successfully' })
    } catch (error: any) {
        console.error('Error creating event:', error)
        return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 })
    }
}

