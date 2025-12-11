import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEventsPaginated, getProvinces, getCounties, getGroups } from "@/lib/supabase/queries"
import { EventsFilter } from "@/components/events/events-filter"
import { EventsView } from "@/components/events/events-view"
import { PaginationControls } from "@/components/ui/pagination-controls"

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
    }

    const { data: events, count } = await getEventsPaginated(filters, page, limit)
    const provinces = await getProvinces()
    const counties = params.provinceId ? await getCounties(params.provinceId) : []
    const groups = params.countyId ? await getGroups(params.countyId) : []

    const totalPages = Math.ceil(count / limit)

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <img src="/images/atlas/events-badge.png" alt="Events" className="h-12 w-12 object-contain" />
                            <h1 className="text-4xl font-bold">Events</h1>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Discover upcoming scouting events across Ireland
                        </p>
                    </div>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EventsFilter
                            provinces={provinces}
                            counties={counties}
                            groups={groups}
                        />
                    </CardContent>
                </Card>

                <EventsView
                    events={events}
                    defaultView={(params.view === 'grid' || params.view === 'list') ? 'grid' : 'calendar'}
                />

                <PaginationControls
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl="/events"
                />
            </div>
        </div>
    )
}

