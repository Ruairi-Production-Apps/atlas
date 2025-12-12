import { NextResponse } from 'next/server'
import { getCounties } from '@/lib/supabase/queries'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const provinceId = searchParams.get('provinceId') || undefined
    const search = searchParams.get('search') || undefined

    try {
        const counties = await getCounties(provinceId, search)
        return NextResponse.json({ counties })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
