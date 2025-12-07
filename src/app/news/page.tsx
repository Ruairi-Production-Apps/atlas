import { Suspense } from 'react'
import { getNewsPosts, getProvinces, getCounties, getGroups } from '@/lib/supabase/queries'
import { NewsPageClient } from './news-client'

interface NewsPageProps {
    searchParams: Promise<{
        search?: string
        provinceId?: string
        countyId?: string
        groupId?: string
        tag?: string
    }>
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
    const params = await searchParams
    
    const filters = {
        search: params.search,
        provinceId: params.provinceId,
        countyId: params.countyId,
        groupId: params.groupId,
        tag: params.tag,
    }

    const [newsPosts, provinces, counties, groups] = await Promise.all([
        getNewsPosts(filters),
        getProvinces(),
        params.provinceId ? getCounties(params.provinceId) : Promise.resolve([]),
        params.countyId ? getGroups(params.countyId) : Promise.resolve([]),
    ])

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewsPageClient
                initialNewsPosts={newsPosts}
                initialProvinces={provinces}
                initialCounties={counties}
                initialGroups={groups}
            />
        </Suspense>
    )
}
