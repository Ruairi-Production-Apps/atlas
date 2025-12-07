import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEvents, getProvinces, getCounties, getGroups } from "@/lib/supabase/queries"
import { EventsFilter } from "@/components/events/events-filter"
import { EventsView } from "@/components/events/events-view"

interface EventsPageProps {
    searchParams: Promise<{
        search?: string
        dateFrom?: string
        dateTo?: string
        provinceId?: string
        countyId?: string
        groupId?: string
        visibility?: string
    }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
    const params = await searchParams

    const filters = {
        search: params.search,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        provinceId: params.provinceId,
        countyId: params.countyId,
        groupId: params.groupId,
        visibility: params.visibility as 'open_to_all' | 'sections_only' | 'scouters_only' | undefined,
    }

    const events = await getEvents(filters)
    const provinces = await getProvinces()
    const counties = params.provinceId ? await getCounties(params.provinceId) : []
    const groups = params.countyId ? await getGroups(params.countyId) : []

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Events</h1>
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

                <EventsView events={events} />
            </div>
        </div>
    )
}

