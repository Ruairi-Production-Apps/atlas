import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// PATCH - Update organization
export async function PATCH(
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

    // Check if user is sysadmin OR admin of this organization
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    // If not sysadmin, check if user is admin of this specific organization
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
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const tableName = type === 'province' ? 'provinces' : type === 'county' ? 'counties' : type === 'team' ? 'adventure_teams' : 'groups'

    const updateData: any = {
        name: body.name,
        description: body.description,
        long_description: body.long_description,
        website: body.website,
        email: body.email,
        facebook_url: body.facebook_url,
        instagram_url: body.instagram_url,
    }

    if (type === 'county' && body.province_id) {
        updateData.province_id = body.province_id
    } else if (type === 'group' && body.county_id) {
        updateData.county_id = body.county_id
    }

    const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Organization updated successfully' })
}

// DELETE - Soft delete organization
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    // Check if user is sysadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    if (!roles) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const tableName = type === 'province' ? 'provinces' : type === 'county' ? 'counties' : type === 'team' ? 'adventure_teams' : 'groups'
        const now = new Date().toISOString()

        // Use admin client to bypass RLS for soft delete operations
        let adminClient
        try {
            adminClient = createAdminClient()
        } catch (error: any) {
            return NextResponse.json({
                error: error.message || 'Admin client initialization failed. Check SUPABASE_SERVICE_ROLE_KEY.'
            }, { status: 500 })
        }

        // Soft delete the organization
        const { error: deleteError } = await adminClient
            .from(tableName)
            .update({ deleted_at: now })
            .eq('id', id)

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 400 })
        }

        // Handle orphaning child organizations
        if (type === 'province') {
            // Orphan counties (set province_id to NULL)
            const { error: orphanError } = await adminClient
                .from('counties')
                .update({ province_id: null })
                .eq('province_id', id)
                .is('deleted_at', null)

            if (orphanError) {
                console.error('Error orphaning counties:', orphanError)
                // Continue anyway - soft delete was successful
            }
        } else if (type === 'county') {
            // Orphan groups (set county_id to NULL)
            const { error: orphanError } = await adminClient
                .from('groups')
                .update({ county_id: null })
                .eq('county_id', id)
                .is('deleted_at', null)

            if (orphanError) {
                console.error('Error orphaning groups:', orphanError)
                // Continue anyway - soft delete was successful
            }
        }

        // Soft delete related news posts
        const { error: newsError } = await adminClient
            .from('news_posts')
            .update({ deleted_at: now })
            .eq('scope_type', type)
            .eq('scope_id', id)
            .is('deleted_at', null)

        if (newsError) {
            console.error('Error soft deleting news posts:', newsError)
            // Continue anyway - main delete was successful
        }

        // Soft delete related events
        const { error: eventsError } = await adminClient
            .from('events')
            .update({ deleted_at: now })
            .eq('scope_type', type)
            .eq('scope_id', id)
            .is('deleted_at', null)

        if (eventsError) {
            console.error('Error soft deleting events:', eventsError)
            // Continue anyway - main delete was successful
        }

        return NextResponse.json({ message: 'Organization deleted successfully' })
    } catch (error: any) {
        console.error('Unexpected error in DELETE route:', error)
        return NextResponse.json({
            error: error.message || 'An unexpected error occurred while deleting the organization'
        }, { status: 500 })
    }
}

