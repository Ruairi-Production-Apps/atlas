import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    let dbQuery = supabase
        .from('tags')
        .select('name')
        .order('name')
        .limit(20)

    if (query) {
        dbQuery = dbQuery.ilike('name', `%${query}%`)
    }

    const { data: tags, error } = await dbQuery

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(tags)
}
