import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { syncToHub } from '@/lib/sync/sync-service'
import { EventSchema } from '@/lib/schemas'
import { handleApiError } from '@/lib/api-utils'

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

        // Validate with Zod
        const validatedData = EventSchema.parse(body)

        const insertData: any = {
            title: validatedData.title,
            featured_image_url: validatedData.featured_image_url || null,
            body: validatedData.body || null,
            tags: validatedData.tags,
            start_date: validatedData.start_date,
            end_date: validatedData.end_date || null,
            location: validatedData.location || null,
            visibility: validatedData.visibility,
            pricing_mode: validatedData.require_payment ? (validatedData.pricing_mode || 'per_scout') : null,
            require_participant_info: validatedData.require_participant_info,
            require_payment: validatedData.require_payment,
            payment_method: validatedData.require_payment ? (validatedData.payment_method || null) : null,
            category: validatedData.category || null,
            selected_section_types: validatedData.visibility === 'sections_only' ? validatedData.selected_section_types : [],
            scope_type: type,
            scope_id: id,
            author_id: user.id,
            published: validatedData.published,
            published_at: validatedData.published ? new Date().toISOString() : null,
            google_map_link: validatedData.google_map_link || null,
            capacity_groups: validatedData.capacity_groups,
            capacity_scouters: validatedData.capacity_scouters,
            capacity_youth: validatedData.capacity_youth,
            is_all_day: validatedData.is_all_day,
            location_type: validatedData.location_type,
            online_meeting_link: validatedData.online_meeting_link || null,
            gear_list_id: validatedData.gear_list_id || null,
        }

        // Handle pricing based on mode (only if payment is required)
        if (validatedData.require_payment) {
            if (validatedData.pricing_mode === 'per_group' || validatedData.pricing_mode === 'per_scout') {
                insertData.price = validatedData.price
            } else if (validatedData.pricing_mode === 'per_person_type') {
                insertData.price_scouter = validatedData.price_scouter
                insertData.price_youth = validatedData.price_youth
            }
        }

        const { data: newEvent, error } = await supabase
            .from('events')
            .insert(insertData)
            .select()
            .single()

        if (error) {
            throw error
        }

        if (newEvent && newEvent.published) {
            await syncToHub('event', 'upsert', newEvent)
        }

        return NextResponse.json({ event: newEvent, message: 'Event created successfully' })
    } catch (error: any) {
        return handleApiError(error)
    }
}

