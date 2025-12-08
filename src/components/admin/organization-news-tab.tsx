'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { NewsPostForm } from './news-post-form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface NewsPost {
    id: string
    title: string
    slug: string
    description: string | null
    featured_image_url: string | null
    body: string | null
    tags: string[]
    published: boolean
    published_at: string | null
    created_at: string
    updated_at: string
}

interface OrganizationNewsTabProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team'
    organizationName: string
}

export function OrganizationNewsTab({
    organizationId,
    organizationType,
    organizationName,
}: OrganizationNewsTabProps) {
    const [newsPosts, setNewsPosts] = useState<NewsPost[]>([])
    const [loading, setLoading] = useState(true)
    const [formOpen, setFormOpen] = useState(false)
    const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [publishingId, setPublishingId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        loadNewsPosts()
    }, [organizationId, organizationType])

    const loadNewsPosts = async () => {
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/news`
            )
            if (!response.ok) throw new Error('Failed to load news posts')
            const data = await response.json()
            setNewsPosts(data.posts || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this news post?')) return

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/news/${postId}`,
                {
                    method: 'DELETE',
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete news post')
            }

            toast({
                title: "News post deleted",
                description: "The news post has been deleted successfully.",
            })

            await loadNewsPosts()
        } catch (err: any) {
            setError(err.message)
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            })
        }
    }

    const handleTogglePublish = async (postId: string, currentPublished: boolean) => {
        setPublishingId(postId)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/news/${postId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ published: !currentPublished }),
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update news post')
            }

            toast({
                title: currentPublished ? "News post unpublished" : "News post published",
                description: `The news post has been ${currentPublished ? 'unpublished' : 'published'} successfully.`,
            })

            await loadNewsPosts()
        } catch (err: any) {
            setError(err.message)
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setPublishingId(null)
        }
    }

    const handleFormSuccess = () => {
        setFormOpen(false)
        setEditingPost(null)
        loadNewsPosts()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">News Posts</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage news posts for {organizationName}
                    </p>
                </div>
                <Button onClick={() => {
                    setEditingPost(null)
                    setFormOpen(true)
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add News Post
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <p className="text-muted-foreground">Loading news posts...</p>
                    ) : newsPosts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No news posts yet. Create your first one!</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {newsPosts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">
                                            {post.title}
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {post.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {post.tags.slice(0, 2).map((tag) => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {post.tags.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{post.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={post.published ? 'default' : 'secondary'}>
                                                {post.published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleTogglePublish(post.id, post.published)}
                                                    disabled={publishingId === post.id}
                                                >
                                                    {publishingId === post.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            {post.published ? 'Unpublishing...' : 'Publishing...'}
                                                        </>
                                                    ) : post.published ? (
                                                        <>
                                                            <EyeOff className="h-4 w-4 mr-2" />
                                                            Unpublish
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Publish
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingPost(post)
                                                        setFormOpen(true)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(post.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent
                    className="max-h-[90vh] overflow-y-auto"
                    style={{ maxWidth: '95vw', width: '95vw' }}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {editingPost ? 'Edit News Post' : 'Create News Post'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPost
                                ? 'Update the news post details'
                                : 'Create a new news post for ' + organizationName}
                        </DialogDescription>
                    </DialogHeader>
                    <NewsPostForm
                        organizationId={organizationId}
                        organizationType={organizationType}
                        post={editingPost}
                        onSuccess={handleFormSuccess}
                        onCancel={() => {
                            setFormOpen(false)
                            setEditingPost(null)
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

