import { NextResponse } from 'next/server'
import { getNewsPosts } from '@/lib/supabase/queries'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    
    const filters = {
        search: searchParams.get('search') || undefined,
        provinceId: searchParams.get('provinceId') || undefined,
        countyId: searchParams.get('countyId') || undefined,
        groupId: searchParams.get('groupId') || undefined,
        tag: searchParams.get('tag') || undefined,
    }

    try {
        const newsPosts = await getNewsPosts(filters)
        return NextResponse.json({ newsPosts })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

