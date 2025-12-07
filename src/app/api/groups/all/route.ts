import { NextResponse } from 'next/server'
import { getGroups } from '@/lib/supabase/queries'

// GET - Get all groups (for form builder Group field type)
export async function GET() {
    try {
        const groups = await getGroups() // Get all groups when no countyId provided
        return NextResponse.json({ groups })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

