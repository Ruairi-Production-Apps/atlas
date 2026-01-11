import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch a gear list by its public share token
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const supabase = await createClient()

        // Fetch gear list with items by share token
        // No authentication required - this is a public endpoint
        const { data: gearList, error } = await supabase
            .from('gear_lists')
            .select(`
                *,
                event:events(id, title, start_date, end_date, location),
                items:gear_list_items(*),
                author:profiles!gear_lists_author_id_fkey(first_name, last_name)
            `)
            .eq('share_token', token)
            .eq('published', true)
            .single()

        if (error || !gearList) {
            console.error('[API] Gear list error:', error)
            console.error('[API] Token:', token)
            return NextResponse.json(
                { error: 'Gear list not found or not published', details: error },
                { status: 404 }
            )
        }

        // Sort items by display_order
        if (gearList.items) {
            gearList.items.sort((a, b) => a.display_order - b.display_order)
        }

        // Group items by category
        const itemsByCategory: Record<string, any[]> = {}
        if (gearList.items) {
            gearList.items.forEach(item => {
                const category = item.category || 'Other'
                if (!itemsByCategory[category]) {
                    itemsByCategory[category] = []
                }
                itemsByCategory[category].push(item)
            })
        }

        // Get organization name based on scope
        let organizationName = ''
        if (gearList.scope_type === 'group') {
            const { data: org } = await supabase
                .from('groups')
                .select('name')
                .eq('id', gearList.scope_id)
                .single()
            organizationName = org?.name || ''
        } else if (gearList.scope_type === 'county') {
            const { data: org } = await supabase
                .from('counties')
                .select('name')
                .eq('id', gearList.scope_id)
                .single()
            organizationName = org?.name || ''
        } else if (gearList.scope_type === 'province') {
            const { data: org } = await supabase
                .from('provinces')
                .select('name')
                .eq('id', gearList.scope_id)
                .single()
            organizationName = org?.name || ''
        }

        return NextResponse.json({
            gearList: {
                ...gearList,
                organization_name: organizationName,
                items_by_category: itemsByCategory
            }
        })

    } catch (error) {
        console.error('Public gear list GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
