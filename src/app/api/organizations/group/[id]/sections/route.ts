import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch sections for this group
        const { data: sections, error } = await supabase
            .from('sections')
            .select('id, name, section_type')
            .eq('group_id', id)
            .order('section_type')

        if (error) {
            console.error('Error fetching sections:', error)
            return NextResponse.json(
                { error: 'Failed to fetch sections' },
                { status: 500 }
            )
        }

        return NextResponse.json({ sections: sections || [] })

    } catch (error) {
        console.error('Sections fetch error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
