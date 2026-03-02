import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List membership forms for a group
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    const { data: forms, error } = await supabase
        .from('membership_forms')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ forms })
}

// POST - Create a new membership form
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data: form, error } = await supabase
        .from('membership_forms')
        .insert({
            group_id: groupId,
            title: body.title || 'Youth Member Registration',
            description: body.description || '',
            published: false
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ form })
}
