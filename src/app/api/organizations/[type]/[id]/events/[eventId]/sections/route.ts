import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Get sections for an event (based on event's selected_section_types)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string }> }
) {
    const { eventId } = await params
    const supabase = await createClient()

    try {
        // Get the event to find selected_section_types
        const { data: event } = await supabase
            .from('events')
            .select('selected_section_types')
            .eq('id', eventId)
            .single()

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        // If event has selected_section_types, return those section type names
        // Otherwise return all section types
        const sectionTypes = event.selected_section_types && event.selected_section_types.length > 0
            ? event.selected_section_types
            : ['beavers', 'cubs', 'scouts', 'ventures', 'rovers']

        const sectionTypeLabels: Record<string, string> = {
            beavers: 'Beavers',
            cubs: 'Cubs',
            scouts: 'Scouts',
            ventures: 'Ventures',
            rovers: 'Rovers',
        }

        const sections = sectionTypes.map((type: string) => ({
            type,
            label: sectionTypeLabels[type] || type,
        }))

        return NextResponse.json({ sections })
    } catch (error: any) {
        console.error('Error fetching event sections:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch sections' }, { status: 500 })
    }
}

