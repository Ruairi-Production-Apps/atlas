import { Suspense } from 'react'
import { getEventsPaginated, getProvinces, getCounties, getGroups } from "@/lib/supabase/queries"
import { EventsClient } from "./events-client"

interface EventsPageProps {
    searchParams: Promise<{
        search?: string
        dateFrom?: string
        dateTo?: string
        provinceId?: string
        countyId?: string
        groupId?: string
        visibility?: string
        category?: string
        section?: string
        page?: string
        view?: string
    }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const limit = 20

    const filters = {
        search: params.search,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        provinceId: params.provinceId,
        countyId: params.countyId,
        groupId: params.groupId,
        visibility: params.visibility as 'open_to_all' | 'sections_only' | 'scouters_only' | undefined,
        category: params.category as 'youth_programme' | 'training' | 'national' | undefined,
        section: params.section,
    }

    const { data: events, count } = await getEventsPaginated(filters, page, limit)
    const provinces = await getProvinces()
    const counties = params.provinceId ? await getCounties(params.provinceId) : []
    const groups = params.countyId ? await getGroups(params.countyId) : []

    const totalPages = Math.ceil(count / limit)

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EventsClient
                initialEvents={events}
                initialProvinces={provinces}
                initialCounties={counties}
                initialGroups={groups}
                currentPage={page}
                totalPages={totalPages}
            />
        </Suspense>
    )
}

