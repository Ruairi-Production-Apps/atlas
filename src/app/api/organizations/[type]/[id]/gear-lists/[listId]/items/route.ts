import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all items for a gear list
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; listId: string }> }
) {
    try {
        const { listId } = await params
        const supabase = await createClient()

        // Fetch items ordered by display_order
        const { data: items, error } = await supabase
            .from('gear_list_items')
            .select('*')
            .eq('gear_list_id', listId)
            .order('display_order', { ascending: true })

        if (error) {
            console.error('Fetch gear list items error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch items' },
                { status: 500 }
            )
        }

        return NextResponse.json({ items: items || [] })

    } catch (error) {
        console.error('Gear list items GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Add a new item to a gear list
export async function POST(
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
        const { item_name, quantity, category, notes, display_order } = body

        // Validate required fields
        if (!item_name) {
            return NextResponse.json(
                { error: 'Item name is required' },
                { status: 400 }
            )
        }

        // Get max display_order if not provided
        let finalDisplayOrder = display_order
        if (finalDisplayOrder === undefined) {
            const { data: maxItem } = await supabase
                .from('gear_list_items')
                .select('display_order')
                .eq('gear_list_id', listId)
                .order('display_order', { ascending: false })
                .limit(1)
                .single()

            finalDisplayOrder = maxItem ? maxItem.display_order + 1 : 0
        }

        // Create item
        const { data: item, error } = await supabase
            .from('gear_list_items')
            .insert({
                gear_list_id: listId,
                item_name,
                quantity: quantity || 1,
                category: category || null,
                notes: notes || null,
                display_order: finalDisplayOrder
            })
            .select()
            .single()

        if (error) {
            console.error('Create gear list item error:', error)
            return NextResponse.json(
                { error: 'Failed to create item' },
                { status: 500 }
            )
        }

        return NextResponse.json({ item }, { status: 201 })

    } catch (error) {
        console.error('Gear list item POST error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH - Update multiple items (for reordering or batch updates)
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
        const { items } = body

        if (!Array.isArray(items)) {
            return NextResponse.json(
                { error: 'Items must be an array' },
                { status: 400 }
            )
        }

        // Update each item
        const updatePromises = items.map(item => {
            // If the item has no persistent ID (new item), insert it instead of updating
            if (!item.id) {
                const insertData = {
                    gear_list_id: listId,
                    item_name: item.item_name,
                    quantity: item.quantity ?? 1,
                    category: item.category ?? null,
                    notes: item.notes ?? null,
                    display_order: item.display_order,
                    updated_at: new Date().toISOString()
                };
                return supabase.from('gear_list_items').insert(insertData).select();
            }

            const updateData: any = {
                updated_at: new Date().toISOString()
            };
            if (item.item_name !== undefined) updateData.item_name = item.item_name;
            if (item.quantity !== undefined) updateData.quantity = item.quantity;
            if (item.category !== undefined) updateData.category = item.category;
            if (item.notes !== undefined) updateData.notes = item.notes;
            if (item.display_order !== undefined) updateData.display_order = item.display_order;

            return supabase
                .from('gear_list_items')
                .update(updateData)
                .eq('id', item.id)
                .eq('gear_list_id', listId);
        });

        await Promise.all(updatePromises)

        // Fetch updated items
        const { data: updatedItems } = await supabase
            .from('gear_list_items')
            .select('*')
            .eq('gear_list_id', listId)
            .order('display_order', { ascending: true })

        return NextResponse.json({ items: updatedItems || [] })

    } catch (error) {
        console.error('Gear list items PATCH error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Delete an item
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; listId: string }> }
) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const itemId = searchParams.get('itemId')

        if (!itemId) {
            return NextResponse.json(
                { error: 'Item ID is required' },
                { status: 400 }
            )
        }

        // Delete item
        const { error } = await supabase
            .from('gear_list_items')
            .delete()
            .eq('id', itemId)

        if (error) {
            console.error('Delete gear list item error:', error)
            return NextResponse.json(
                { error: 'Failed to delete item' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Gear list item DELETE error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
