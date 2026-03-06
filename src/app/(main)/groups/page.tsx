import { Suspense } from "react"
import { getGroups, getCounties } from "@/lib/supabase/queries"
import { GroupsClient } from "./groups-client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface GroupsPageProps {
    searchParams: Promise<{
        countyId?: string
        search?: string
    }>
}

export default async function GroupsPage(props: GroupsPageProps) {
    const searchParams = await props.searchParams
    const countyId = searchParams.countyId
    const search = searchParams.search

    const [groups, counties] = await Promise.all([
        getGroups(countyId, search),
        getCounties() // Fetch all counties for filter
    ])

    return (
        <Suspense fallback={
            <div className="flex justify-center py-12">
                <LoadingSpinner size={40} />
            </div>
        }>
            <GroupsClient
                initialGroups={groups}
                initialCounties={counties}
            />
        </Suspense>
    )
}
