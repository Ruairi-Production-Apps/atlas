import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH - Update news post
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; postId: string }> }
) {
    const { type, id, postId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
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
                .eq('can_manage_news', true)
                .single()
            hasPermission = !!member
        }
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.featured_image_url !== undefined) updateData.featured_image_url = body.featured_image_url
    if (body.body !== undefined) updateData.body = body.body
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.published !== undefined) updateData.published = body.published

    const { error } = await supabase
        .from('news_posts')
        .update(updateData)
        .eq('id', postId)
        .eq('scope_type', type)
        .eq('scope_id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'News post updated successfully' })
}

// DELETE - Soft delete news post
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; postId: string }> }
) {
    const { type, id, postId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
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
                .eq('can_manage_news', true)
                .single()
            hasPermission = !!member
        }
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete
    const { error } = await supabase
        .from('news_posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('scope_type', type)
        .eq('scope_id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'News post deleted successfully' })
}

