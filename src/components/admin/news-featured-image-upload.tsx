'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

interface NewsFeaturedImageUploadProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group'
    postId: string | null
    currentImageUrl: string | null
    onImageUpdate: (imageUrl: string | null) => void
}

export function NewsFeaturedImageUpload({
    organizationId,
    organizationType,
    postId,
    currentImageUrl,
    onImageUpdate,
}: NewsFeaturedImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(currentImageUrl)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed.')
            return
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            setError('File size exceeds 10MB limit.')
            return
        }

        setError(null)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload file
        handleUpload(file)
    }

    const handleUpload = async (file: File) => {
        setUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const url = postId
                ? `/api/organizations/${organizationType}/${organizationId}/news/${postId}/featured-image`
                : `/api/organizations/${organizationType}/${organizationId}/news/featured-image`

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image')
            }

            onImageUpdate(data.image_url)
        } catch (err: any) {
            setError(err.message || 'Failed to upload image')
            // Reset preview on error
            setPreview(currentImageUrl)
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async () => {
        if (!currentImageUrl || !postId) return

        setUploading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/news/${postId}/featured-image`,
                {
                    method: 'DELETE',
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete image')
            }

            setPreview(null)
            onImageUpdate(null)
        } catch (err: any) {
            setError(err.message || 'Failed to delete image')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Label>Featured Image</Label>
            <div className="flex items-start gap-4">
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Featured image"
                            className="w-48 h-32 object-cover border border-input rounded-md bg-muted"
                        />
                        {currentImageUrl && postId && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={handleDelete}
                                disabled={uploading}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
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
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

