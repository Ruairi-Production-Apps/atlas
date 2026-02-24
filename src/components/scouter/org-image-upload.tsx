'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface OrgImageUploadProps {
    organizationId: string
    currentImageUrl: string | null
    onImageUpdate: (imageUrl: string | null) => void
    label?: string
    bucket?: string
    aspectRatio?: 'square' | 'video' | 'any'
}

export function OrgImageUpload({
    organizationId,
    currentImageUrl,
    onImageUpdate,
    label = "Image",
    bucket = "organization-assets",
    aspectRatio = "any"
}: OrgImageUploadProps) {
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

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            toast({ variant: "destructive", title: "File too large", description: "File size exceeds 10MB limit." })
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
            const fileName = `${organizationId}/${Math.random().toString(36).substring(7)}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            onImageUpdate(publicUrl)
            toast({ title: "Image uploaded", description: `${label} updated successfully` })

        } catch (err: any) {
            console.error('Upload error:', err)
            toast({ variant: "destructive", title: "Upload failed", description: err.message || "Failed to upload image" })
            setPreview(currentImageUrl) // Revert preview
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = () => {
        setPreview(null)
        onImageUpdate(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="space-y-4">
            <Label>{label}</Label>
            <div className="flex items-start gap-4">
                {preview ? (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt={label}
                            className={cn(
                                "object-cover border border-input rounded-md bg-muted",
                                aspectRatio === 'square' ? "w-32 h-32" : "w-48 h-32"
                            )}
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
                    <div className={cn(
                        "border border-dashed border-input rounded-md bg-muted flex items-center justify-center",
                        aspectRatio === 'square' ? "w-32 h-32" : "w-48 h-32"
                    )}>
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
                        Max 10MB. Formats: JPEG, PNG, GIF, WebP, SVG
                    </p>
                </div>
            </div>
        </div>
    )
}
