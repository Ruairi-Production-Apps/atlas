import { NextResponse } from 'next/server'
import { getGroups } from '@/lib/supabase/queries'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const countyId = searchParams.get('countyId') || undefined
    const search = searchParams.get('search') || undefined

    try {
        const groups = await getGroups(countyId, search)
        return NextResponse.json({ groups })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
