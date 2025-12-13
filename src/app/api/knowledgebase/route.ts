import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgebaseArticlesPaginated, KnowledgebaseFilters } from '@/lib/supabase/queries'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const filters: KnowledgebaseFilters = {
        search: searchParams.get('search') || undefined,
        provinceId: searchParams.get('provinceId') || undefined,
        countyId: searchParams.get('countyId') || undefined,
        groupId: searchParams.get('groupId') || undefined,
        adventureSkills: searchParams.get('adventureSkills') ? searchParams.get('adventureSkills')?.split(',') : undefined,
        categories: searchParams.get('categories') ? searchParams.get('categories')?.split(',') : undefined,
        sections: searchParams.get('sections') ? searchParams.get('sections')?.split(',') : undefined,
    }

    try {
        const { data: articles, count } = await getKnowledgebaseArticlesPaginated(filters, page, limit)

        return NextResponse.json({
            articles,
            count
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
