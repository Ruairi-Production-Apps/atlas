import { NextResponse } from 'next/server'
import { getNewsPostsPaginated } from '@/lib/supabase/queries'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const filters = {
        search: searchParams.get('search') || undefined,
        provinceId: searchParams.get('provinceId') || undefined,
        countyId: searchParams.get('countyId') || undefined,
        groupId: searchParams.get('groupId') || undefined,
        tag: searchParams.get('tag') || undefined,
    }

    try {
        const { data: newsPosts, count } = await getNewsPostsPaginated(filters, page, limit)
        return NextResponse.json({ newsPosts, count })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

