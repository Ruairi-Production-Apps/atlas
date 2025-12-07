import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// POST - Upload featured image for new event (before event is created)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions (same as events POST)
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    if (!hasPermission) {
        let adminRole = null
        if (type === 'province') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'provincial_admin')
                .eq('scope_type', 'province')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'county') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'county_admin')
                .eq('scope_type', 'county')
                .eq('scope_id', id)
                .single()
            adminRole = data
        } else if (type === 'group') {
            const { data } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'group_leader')
                .eq('scope_type', 'group')
                .eq('scope_id', id)
                .single()
            adminRole = data
        }
        hasPermission = !!adminRole

        if (!hasPermission) {
            const { data: member } = await supabase
                .from('organization_members')
                .select('*')
                .eq('user_id', user.id)
                .eq('organization_type', type)
                .eq('organization_id', id)
                .eq('can_manage_events', true)
                .single()
            hasPermission = !!member
        }
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${type}/${id}/${Date.now()}.${fileExt}`

        // Upload to Supabase Storage using admin client
        const adminClient = createAdminClient()
        const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('news-images')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false,
            })

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 400 })
        }

        // Get public URL
        const { data: urlData } = adminClient.storage
            .from('news-images')
            .getPublicUrl(fileName)

        const imageUrl = urlData.publicUrl

        return NextResponse.json({ 
            image_url: imageUrl,
            message: 'Image uploaded successfully' 
        })
    } catch (error: any) {
        console.error('Error uploading image:', error)
        return NextResponse.json({ 
            error: error.message || 'Failed to upload image' 
        }, { status: 500 })
    }
}

