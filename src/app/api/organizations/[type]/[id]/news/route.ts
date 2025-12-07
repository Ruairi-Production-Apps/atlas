import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List news posts for organization
export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const { checkOrganizationPermission } = await import('@/lib/auth-utils')
    const hasPermission = await checkOrganizationPermission(supabase, user.id, type, id, 'can_manage_news')

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all news posts (including unpublished)
    const { data: posts, error } = await supabase
        .from('news_posts')
        .select('*')
        .eq('scope_type', type)
        .eq('scope_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ posts: posts || [] })
}

// POST - Create news post
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const { checkOrganizationPermission } = await import('@/lib/auth-utils')
    const hasPermission = await checkOrganizationPermission(supabase, user.id, type, id, 'can_manage_news')

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const { data: post, error } = await supabase
        .from('news_posts')
        .insert({
            title: body.title,
            description: body.description || null,
            featured_image_url: body.featured_image_url || null,
            body: body.body || null,
            tags: body.tags || [],
            scope_type: type,
            scope_id: id,
            author_id: user.id,
            published: body.published || false,
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ post, message: 'News post created successfully' })
}

