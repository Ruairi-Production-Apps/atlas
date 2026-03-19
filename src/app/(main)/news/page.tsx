import { Suspense } from 'react'
import { getNewsPostsPaginated, getProvinces, getCounties, getGroups } from '@/lib/supabase/queries'
import { NewsPageClient } from './news-client'
import { isInstance, APP_CONFIG } from '@/lib/config/app-config'

interface NewsPageProps {
    searchParams: Promise<{
        search?: string
        provinceId?: string
        countyId?: string
        groupId?: string
        tag?: string
        page?: string
    }>
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const limit = 20

    const filters: Record<string, any> = {
        search: params.search,
        provinceId: params.provinceId,
        countyId: params.countyId,
        groupId: params.groupId,
        tag: params.tag,
    }

    // In Instance mode, always scope to the home org
    if (isInstance() && APP_CONFIG.homeOrgId && APP_CONFIG.homeOrgType) {
        filters.groupId = APP_CONFIG.homeOrgType === 'group' ? APP_CONFIG.homeOrgId : undefined
        filters.countyId = APP_CONFIG.homeOrgType === 'county' ? APP_CONFIG.homeOrgId : undefined
        filters.provinceId = APP_CONFIG.homeOrgType === 'province' ? APP_CONFIG.homeOrgId : undefined
    }

    const [newsResult, provinces, counties, groups] = await Promise.all([
        getNewsPostsPaginated(filters, page, limit),
        getProvinces(),
        params.provinceId ? getCounties(params.provinceId) : Promise.resolve([]),
        params.countyId ? getGroups(params.countyId) : Promise.resolve([]),
    ])

    const { data: newsPosts, count } = newsResult
    const totalPages = Math.ceil(count / limit)

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewsPageClient
                initialNewsPosts={newsPosts}
                initialProvinces={provinces}
                initialCounties={counties}
                initialGroups={groups}
                currentPage={page}
                totalPages={totalPages}
            />
        </Suspense>
    )
}
