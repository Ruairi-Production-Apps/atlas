import { NextResponse } from 'next/server'
import { getEventsPaginated, EventFilters } from '@/lib/supabase/queries'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    // Extract filter parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const filters: EventFilters = {
        search: searchParams.get('search') || undefined,
        dateFrom: searchParams.get('dateFrom') || undefined,
        dateTo: searchParams.get('dateTo') || undefined,
        provinceId: searchParams.get('provinceId') || undefined,
        countyId: searchParams.get('countyId') || undefined,
        groupId: searchParams.get('groupId') || undefined,
        visibility: searchParams.get('visibility') as any || undefined, // Type assertion as validation happens in query if enum
        category: searchParams.get('category') as any || undefined,
        section: searchParams.get('section') || undefined,
    }

    try {
        const { data, count } = await getEventsPaginated(filters, page, limit)
        return NextResponse.json({ events: data, count })
    } catch (error: any) {
        console.error('Error fetching events:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
