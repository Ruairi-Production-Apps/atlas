import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// GET - List all gear lists for an organization
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    try {
        const { type, id } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch gear lists with item counts and event titles
        const { data: gearLists, error } = await supabase
            .from('gear_lists')
            .select(`
                *,
                event:events(id, title),
                items:gear_list_items(id)
            `)
            .eq('scope_type', type)
            .eq('scope_id', id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Fetch gear lists error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch gear lists' },
                { status: 500 }
            )
        }

        // Transform data to include item count
        const transformedLists = gearLists?.map(list => ({
            ...list,
            event_title: list.event?.title || null,
            items_count: list.items?.length || 0
        })) || []

        return NextResponse.json({ gearLists: transformedLists })

    } catch (error) {
        console.error('Gear lists GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Create a new gear list
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    try {
        const { type, id } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, published } = body

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        // Generate unique share token
        const shareToken = crypto.randomBytes(16).toString('base64url')

        // Create gear list
        const { data: gearList, error } = await supabase
            .from('gear_lists')
            .insert({
                title,
                description,
                scope_type: type,
                scope_id: id,
                author_id: user.id,
                published: published ?? true,
                share_token: shareToken
            })
            .select()
            .single()

        if (error) {
            console.error('Create gear list error:', error)
            return NextResponse.json(
                { error: 'Failed to create gear list' },
                { status: 500 }
            )
        }

        return NextResponse.json({ gearList }, { status: 201 })

    } catch (error) {
        console.error('Gear list POST error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
