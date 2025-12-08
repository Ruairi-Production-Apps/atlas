
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
        return NextResponse.json({ users: [] })
    }

    const supabase = await createClient()

    // Search by email, first_name, or last_name
    // Using simple ILIKE for flexibility
    // Note: Profiles are usually public or accessible by authenticated users
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, avatar_url')
        .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(10)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users })
}
