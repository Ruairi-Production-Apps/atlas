'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface KBFeaturedImageUploadProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team' | 'sitewide'
    eventId: string | null // Kept for compatibility but treated as articleId
    currentImageUrl: string | null
    onImageUpdate: (imageUrl: string | null) => void
    isDraft?: boolean
}

export function KBFeaturedImageUpload({
    organizationId,
    organizationType,
    eventId,
    currentImageUrl,
    onImageUpdate,
}: KBFeaturedImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentImageUrl)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()
    const { toast } = useToast()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
        if (!allowedTypes.includes(file.type)) {
            toast({ variant: "destructive", title: "Invalid file type", description: "Only images (JPEG, PNG, GIF, WebP, SVG) are allowed." })
            return
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            toast({ variant: "destructive", title: "File too large", description: "File size exceeds 5MB limit." })
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload file
        await handleUpload(file)
    }

    const handleUpload = async (file: File) => {
        setUploading(true)

        try {
            const fileExt = file.name.split('.').pop()
            // Use article ID if available, otherwise random temp ID (or just generic folder)
            // If it's a new article (eventId is null), we can put it in a 'temp' or 'new' folder, 
            // or just use a random path. Parent form saves the URL so path matters less for linking.
            const pathId = eventId || Math.random().toString(36).substring(7)
            const fileName = `${pathId}/featured-${Math.random().toString(36).substring(7)}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('knowledgebase-files')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('knowledgebase-files')
                .getPublicUrl(fileName)

            onImageUpdate(publicUrl)
            toast({ title: "Image uploaded", description: "Featured image updated successfully" })

        } catch (err: any) {
            console.error('Upload error:', err)
            toast({ variant: "destructive", title: "Upload failed", description: err.message || "Failed to upload image" })
            setPreview(currentImageUrl) // Revert preview
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = () => {
        // Just clear the state. 
        // We rely on the parent form logic to save the null 'featured_image_url' to the DB.
        // We don't necessarily need to delete the file from storage immediately.
        setPreview(null)
        onImageUpdate(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="space-y-4">
            <Label>Featured Image</Label>
            <div className="flex items-start gap-4">
                {preview ? (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Featured image"
                            className="w-48 h-32 object-cover border border-input rounded-md bg-muted"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-100 shadow-sm"
                            onClick={handleDelete}
                            disabled={uploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="w-48 h-32 border border-dashed border-input rounded-md bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}
                <div className="flex-1 space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Recommended: Landscape image, max 10MB. Formats: JPEG, PNG, GIF, WebP, SVG
                    </p>
                </div>
            </div>
        </div>
    )
}

