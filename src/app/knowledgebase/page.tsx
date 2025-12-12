import { Suspense } from 'react'
import { getKnowledgebaseArticlesPaginated, getProvinces, getCounties, getGroups } from "@/lib/supabase/queries"
import { KnowledgebaseClient } from "./knowledgebase-client"

interface KnowledgebasePageProps {
    searchParams: Promise<{
        search?: string
        provinceId?: string
        countyId?: string
        groupId?: string
        adventureSkill?: string
        page?: string
    }>
}

export default async function KnowledgebasePage({ searchParams }: KnowledgebasePageProps) {
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const limit = 20

    const filters = {
        search: params.search,
        provinceId: params.provinceId,
        countyId: params.countyId,
        groupId: params.groupId,
        adventureSkill: params.adventureSkill,
    }

    const { data: articles, count } = await getKnowledgebaseArticlesPaginated(filters, page, limit)
    const provinces = await getProvinces()
    const counties = params.provinceId ? await getCounties(params.provinceId) : []
    const groups = params.countyId ? await getGroups(params.countyId) : []

    const totalPages = Math.ceil(count / limit)

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <KnowledgebaseClient
                initialArticles={articles}
                initialProvinces={provinces}
                initialCounties={counties}
                initialGroups={groups}
                currentPage={page}
                totalPages={totalPages}
            />
        </Suspense>
    )
}

