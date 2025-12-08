import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Create organization
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string }> }
) {
    const { type } = await params
    const supabase = await createClient()

    // Check if user is sysadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    if (!roles) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    let organizationId: string | null = null

    if (type === 'province') {
        const { data, error } = await supabase
            .from('provinces')
            .insert({
                name: body.name,
                description: body.description,
                long_description: body.long_description,
                website: body.website,
                email: body.email,
                facebook_url: body.facebook_url,
                instagram_url: body.instagram_url,
            })
            .select('id')
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        organizationId = data.id
    } else if (type === 'county') {
        if (!body.province_id) {
            return NextResponse.json({ error: 'province_id is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('counties')
            .insert({
                province_id: body.province_id,
                name: body.name,
                description: body.description,
                long_description: body.long_description,
                website: body.website,
                email: body.email,
                facebook_url: body.facebook_url,
                instagram_url: body.instagram_url,
            })
            .select('id')
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        organizationId = data.id
    } else if (type === 'group') {
        if (!body.county_id) {
            return NextResponse.json({ error: 'county_id is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('groups')
            .insert({
                county_id: body.county_id,
                name: body.name,
                description: body.description,
                long_description: body.long_description,
                website: body.website,
                email: body.email,
                facebook_url: body.facebook_url,
                instagram_url: body.instagram_url,
            })
            .select('id')
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        organizationId = data.id
    } else {
        return NextResponse.json({ error: 'Invalid organization type' }, { status: 400 })
    }


    // Insert contacts if provided
    if (organizationId && body.contacts && Array.isArray(body.contacts) && body.contacts.length > 0) {
        const contactsToInsert = body.contacts.map((contact: any, index: number) => ({
            organization_id: organizationId,
            organization_type: type,
            name: contact.name,
            title: contact.title,
            email: contact.email || null,
            display_order: typeof contact.display_order === 'number' ? contact.display_order : index
        }))

        const { error: contactsError } = await supabase
            .from('organization_contacts')
            .insert(contactsToInsert)

        if (contactsError) {
            console.error('Failed to insert contacts:', contactsError)
            // Continue anyway, organization was created
        }
    }

    return NextResponse.json({
        message: 'Organization created successfully',
        organization: { id: organizationId }
    })
}

