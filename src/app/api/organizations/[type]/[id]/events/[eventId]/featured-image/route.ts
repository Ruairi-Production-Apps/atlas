import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// POST - Upload featured image for existing event
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string }> }
) {
    const { type, id, eventId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions (same as events PATCH)
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

        // Get current image URL to delete old one
        const { data: event } = await supabase
            .from('events')
            .select('featured_image_url')
            .eq('id', eventId)
            .single()

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${type}/${id}/${eventId}/${Date.now()}.${fileExt}`

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

        // Update event with image URL
        const { error: updateError } = await supabase
            .from('events')
            .update({ featured_image_url: imageUrl })
            .eq('id', eventId)

        if (updateError) {
            // Try to delete uploaded file if update fails
            await adminClient.storage.from('news-images').remove([fileName])
            return NextResponse.json({ error: updateError.message }, { status: 400 })
        }

        // Delete old image if it exists
        if (event?.featured_image_url) {
            const oldUrlParts = event.featured_image_url.split('/news-images/')
            if (oldUrlParts.length >= 2) {
                const oldFilePath = oldUrlParts[1]
                await adminClient.storage.from('news-images').remove([oldFilePath])
            }
        }

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

// DELETE - Remove featured image
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string; eventId: string }> }
) {
    const { type, id, eventId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions (same as events PATCH)
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
        // Get current image URL
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('featured_image_url')
            .eq('id', eventId)
            .single()

        if (fetchError || !event?.featured_image_url) {
            return NextResponse.json({ error: 'No image found' }, { status: 404 })
        }

        // Extract file path from URL
        const imageUrl = event.featured_image_url
        const urlParts = imageUrl.split('/news-images/')
        if (urlParts.length < 2) {
            return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
        }

        const filePath = urlParts[1]

        // Delete from storage using admin client
        const adminClient = createAdminClient()
        const { error: deleteError } = await adminClient.storage
            .from('news-images')
            .remove([filePath])

        if (deleteError) {
            console.error('Error deleting image from storage:', deleteError)
            // Continue to update database even if storage delete fails
        }

        // Update event to remove image URL
        const { error: updateError } = await supabase
            .from('events')
            .update({ featured_image_url: null })
            .eq('id', eventId)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 400 })
        }

        return NextResponse.json({ message: 'Image deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting image:', error)
        return NextResponse.json({ 
            error: error.message || 'Failed to delete image' 
        }, { status: 500 })
    }
}

