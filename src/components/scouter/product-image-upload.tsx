'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

interface ProductImageUploadProps {
    currentImageUrl: string | null
    onImageUpdate: (imageUrl: string | null) => void
}

export function ProductImageUpload({
    currentImageUrl,
    onImageUpdate,
}: ProductImageUploadProps) {
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

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            setError('File size exceeds 5MB limit.')
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

            const response = await fetch('/api/store/upload-image', {
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
            onImageUpdate(currentImageUrl) // Revert
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = () => {
        setPreview(null)
        onImageUpdate(null)
        // Note: We don't delete from storage immediately on 'remove' to keep it simple, 
        // or we could implement a delete API. For now, simple unlink.
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
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-100 transition-opacity"
                            onClick={handleDelete}
                            disabled={uploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div
                        className="w-48 h-32 border-2 border-dashed border-input rounded-md bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Click to upload</span>
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
                    <div className="flex flex-col gap-1">
                        {!preview && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </Button>
                        )}
                        {preview && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                Change Image
                            </Button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Max 5MB. Formats: JPEG, PNG, GIF, WebP
                    </p>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
