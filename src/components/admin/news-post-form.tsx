'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { NewsFeaturedImageUpload } from './news-featured-image-upload'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface NewsPost {
    id: string
    title: string
    description: string | null
    featured_image_url: string | null
    body: string | null
    tags: string[]
    published: boolean
}

interface NewsPostFormProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group'
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
    const [tagInput, setTagInput] = useState('')
    const [formData, setFormData] = useState({
        title: post?.title || '',
        description: post?.description || '',
        featured_image_url: post?.featured_image_url || '',
        body: post?.body || '',
        tags: post?.tags || [],
        published: post?.published || true,
    })

    const handleAddTag = () => {
        const tag = tagInput.trim()
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag],
            }))
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove),
        }))
    }

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    featured_image_url: formData.featured_image_url || null,
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
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                    <Input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddTag()
                            }
                        }}
                        placeholder="Add a tag and press Enter"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                        Add
                    </Button>
                </div>
                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
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

