import { getProvinces } from '@/lib/supabase/queries'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const provinces = await getProvinces()
        return NextResponse.json({ provinces })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

