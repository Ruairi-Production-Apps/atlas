import { Suspense } from 'react'
import { getKnowledgebaseArticlesPaginated, getProvinces, getCounties, getGroups } from "@/lib/supabase/queries"
import { KnowledgebaseClient } from "./knowledgebase-client"

interface KnowledgebasePageProps {
    searchParams: Promise<{
        search?: string
        provinceId?: string
        countyId?: string
        groupId?: string
        adventureSkills?: string // Comma-separated adventure skill names
        categories?: string // Comma-separated category names
        sections?: string // Comma-separated section names
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
        adventureSkills: params.adventureSkills ? params.adventureSkills.split(',') : undefined,
        categories: params.categories ? params.categories.split(',') : undefined,
        sections: params.sections ? params.sections.split(',') : undefined,
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

