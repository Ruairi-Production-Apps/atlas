import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        // Upload to Supabase Storage using admin client
        const adminClient = createAdminClient()
        const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('rich-text-images')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false,
            })

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 400 })
        }

        // Get public URL
        const { data: urlData } = adminClient.storage
            .from('rich-text-images')
            .getPublicUrl(fileName)

        const imageUrl = urlData.publicUrl

        return NextResponse.json({ 
            url: imageUrl,
            message: 'Image uploaded successfully' 
        })
    } catch (error: any) {
        console.error('Error uploading image:', error)
        return NextResponse.json({ 
            error: error.message || 'Failed to upload image' 
        }, { status: 500 })
    }
}

