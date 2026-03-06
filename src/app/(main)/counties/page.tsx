import { Suspense } from "react"
import { getCounties, getProvinces } from "@/lib/supabase/queries"
import { CountiesClient } from "./counties-client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface CountiesPageProps {
    searchParams: Promise<{
        provinceId?: string
        search?: string
    }>
}

export default async function CountiesPage(props: CountiesPageProps) {
    const searchParams = await props.searchParams
    const provinceId = searchParams.provinceId
    const search = searchParams.search

    const [counties, provinces] = await Promise.all([
        getCounties(provinceId, search),
        getProvinces()
    ])

    return (
        <Suspense fallback={
            <div className="flex justify-center py-12">
                <LoadingSpinner size={40} />
            </div>
        }>
            <CountiesClient
                initialCounties={counties}
                initialProvinces={provinces}
            />
        </Suspense>
    )
}
