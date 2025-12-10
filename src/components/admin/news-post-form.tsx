'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { NewsFeaturedImageUpload } from './news-featured-image-upload'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TagInput } from '@/components/ui/tag-input'

interface NewsPost {
    id: string
    title: string
    description: string | null
    featured_image_url: string | null
    body: string | null
    tags: string[]
    published: boolean
    published_at: string | null
}

interface NewsPostFormProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team' | 'sitewide'
    post?: NewsPost | null
    onSuccess: () => void
    onCancel: () => void
}

export function NewsPostForm({
    organizationId,
    organizationType,
    post,
    onSuccess,
    onCancel,
}: NewsPostFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: post?.title || '',
        description: post?.description || '',
        featured_image_url: post?.featured_image_url || '',
        body: post?.body || '',
        tags: post?.tags || [],
        published: post?.published || true,
    })



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // If creating new post and we have an image URL but no postId yet,
            // the image was uploaded via the temporary endpoint and is already in formData
            const url = post
                ? `/api/organizations/${organizationType}/${organizationId}/news/${post.id}`
                : `/api/organizations/${organizationType}/${organizationId}/news`

            const method = post ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({
                    ...formData,
                    featured_image_url: formData.featured_image_url || null,
                    published_at: formData.published ? (post?.published_at || new Date().toISOString()) : null,
                }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to save news post')

            onSuccess()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="A brief description of the news post"
                />
            </div>

            <NewsFeaturedImageUpload
                organizationId={organizationId}
                organizationType={organizationType}
                postId={post?.id || null}
                currentImageUrl={formData.featured_image_url}
                onImageUpdate={(imageUrl) => setFormData(prev => ({ ...prev, featured_image_url: imageUrl || '' }))}
            />

            <div className="space-y-2">
                <Label htmlFor="body">News Post Content</Label>
                <RichTextEditor
                    content={formData.body}
                    onChange={(content) => setFormData(prev => ({ ...prev, body: content }))}
                    placeholder="Enter the full news post content..."
                />
            </div>

            <div className="space-y-2">
                <Label>Tags</Label>
                <TagInput
                    selectedTags={formData.tags}
                    onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                    placeholder="Add tags..."
                />
            </div>

            <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : post ? 'Update News Post' : 'Create News Post'}
                </Button>
            </div>
        </form>
    )
}

