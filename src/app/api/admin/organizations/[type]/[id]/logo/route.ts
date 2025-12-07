import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// POST - Upload organization logo
export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is sysadmin OR admin of this organization
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    // If not sysadmin, check if user is admin of this specific organization
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

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 })
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${type}/${id}/${Date.now()}.${fileExt}`

        // Upload to Supabase Storage using admin client
        const adminClient = createAdminClient()
        const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('organization-logos')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false,
            })

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 400 })
        }

        // Get public URL
        const { data: urlData } = adminClient.storage
            .from('organization-logos')
            .getPublicUrl(fileName)

        const logoUrl = urlData.publicUrl

        // Update organization with logo URL
        const tableName = type === 'province' ? 'provinces' : type === 'county' ? 'counties' : 'groups'
        const { error: updateError } = await supabase
            .from(tableName)
            .update({ logo_url: logoUrl })
            .eq('id', id)

        if (updateError) {
            // Try to delete uploaded file if update fails
            await adminClient.storage.from('organization-logos').remove([fileName])
            return NextResponse.json({ error: updateError.message }, { status: 400 })
        }

        return NextResponse.json({ 
            logo_url: logoUrl,
            message: 'Logo uploaded successfully' 
        })
    } catch (error: any) {
        console.error('Error uploading logo:', error)
        return NextResponse.json({ 
            error: error.message || 'Failed to upload logo' 
        }, { status: 500 })
    }
}

// DELETE - Remove organization logo
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is sysadmin OR admin of this organization
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    let hasPermission = !!sysadminRole

    // If not sysadmin, check if user is admin of this specific organization
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
    }

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        // Get current logo URL
        const tableName = type === 'province' ? 'provinces' : type === 'county' ? 'counties' : 'groups'
        const { data: org, error: fetchError } = await supabase
            .from(tableName)
            .select('logo_url')
            .eq('id', id)
            .single()

        if (fetchError || !org?.logo_url) {
            return NextResponse.json({ error: 'No logo found' }, { status: 404 })
        }

        // Extract file path from URL
        const logoUrl = org.logo_url
        const urlParts = logoUrl.split('/organization-logos/')
        if (urlParts.length < 2) {
            return NextResponse.json({ error: 'Invalid logo URL' }, { status: 400 })
        }

        const filePath = urlParts[1]

        // Delete from storage using admin client
        const adminClient = createAdminClient()
        const { error: deleteError } = await adminClient.storage
            .from('organization-logos')
            .remove([filePath])

        if (deleteError) {
            console.error('Error deleting logo from storage:', deleteError)
            // Continue to update database even if storage delete fails
        }

        // Update organization to remove logo URL
        const { error: updateError } = await supabase
            .from(tableName)
            .update({ logo_url: null })
            .eq('id', id)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 400 })
        }

        return NextResponse.json({ message: 'Logo deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting logo:', error)
        return NextResponse.json({ 
            error: error.message || 'Failed to delete logo' 
        }, { status: 500 })
    }
}

