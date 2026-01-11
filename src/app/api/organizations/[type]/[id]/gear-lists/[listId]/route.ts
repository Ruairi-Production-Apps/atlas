import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// GET - Fetch a specific gear list with its items
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; listId: string }> }
) {
    try {
        const { listId } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch gear list with items
        const { data: gearList, error } = await supabase
            .from('gear_lists')
            .select(`
                *,
                event:events(id, title),
                items:gear_list_items(*)
            `)
            .eq('id', listId)
            .single()

        if (error) {
            console.error('Fetch gear list error:', error)
            return NextResponse.json(
                { error: 'Gear list not found' },
                { status: 404 }
            )
        }

        // Sort items by display_order
        if (gearList.items) {
            gearList.items.sort((a: any, b: any) => a.display_order - b.display_order)
        }

        return NextResponse.json({ gearList })

    } catch (error) {
        console.error('Gear list GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH - Update a gear list
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; listId: string }> }
) {
    try {
        const { listId } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, published, regenerate_token } = body

        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (published !== undefined) updateData.published = published

        // Regenerate share token if requested
        if (regenerate_token) {
            updateData.share_token = crypto.randomBytes(16).toString('base64url')
        }

        // Update gear list
        const { data: gearList, error } = await supabase
            .from('gear_lists')
            .update(updateData)
            .eq('id', listId)
            .select()
            .single()

        if (error) {
            console.error('Update gear list error:', error)
            return NextResponse.json(
                { error: 'Failed to update gear list' },
                { status: 500 }
            )
        }

        return NextResponse.json({ gearList })

    } catch (error) {
        console.error('Gear list PATCH error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Delete a gear list
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; listId: string }> }
) {
    try {
        const { listId } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Delete gear list (items will cascade delete)
        const { error } = await supabase
            .from('gear_lists')
            .delete()
            .eq('id', listId)

        if (error) {
            console.error('Delete gear list error:', error)
            return NextResponse.json(
                { error: 'Failed to delete gear list' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Gear list DELETE error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
