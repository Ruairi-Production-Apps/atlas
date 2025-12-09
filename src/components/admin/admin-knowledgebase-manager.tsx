"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Search, Loader2, Trash2, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'

interface AdminKnowledgebaseManagerProps {
    user: any
}

export function AdminKnowledgebaseManager({ user }: AdminKnowledgebaseManagerProps) {
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchArticles()
    }, [])

    const fetchArticles = async () => {
        setLoading(true)
        try {
            // Fetch ALL articles with author details
            const { data, error } = await supabase
                .from('knowledgebase_articles')
                .select(`
                    *,
                    author:profiles(first_name, last_name, email)
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching knowledgebase articles:', error)
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch articles" })
            } else {
                setArticles(data || [])
            }
        } catch (err) {
            console.error('Unexpected error:', err)
        } finally {
            setLoading(false)
        }
    }

    const togglePublish = async (articleId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('knowledgebase_articles')
            .update({ published: !currentStatus })
            .eq('id', articleId)

        if (!error) {
            setArticles(articles.map(a =>
                a.id === articleId ? { ...a, published: !currentStatus } : a
            ))
            toast({ title: "Status Updated", description: `Article ${!currentStatus ? 'published' : 'unpublished'}` })
        } else {
            toast({ variant: "destructive", title: "Error", description: "Failed to update status" })
        }
    }

    const deleteArticle = async (articleId: string) => {
        if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) return

        const { error } = await supabase
            .from('knowledgebase_articles')
            .delete()
            .eq('id', articleId)

        if (!error) {
            setArticles(articles.filter(a => a.id !== articleId))
            toast({ title: "Article Deleted", description: "The article has been permanently removed." })
        } else {
            console.error('Error deleting article:', error)
            toast({ variant: "destructive", title: "Error", description: "Failed to delete article" })
        }
    }

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.author?.first_name + ' ' + article.author?.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getAuthorName = (article: any) => {
        if (article.author) {
            const name = `${article.author.first_name || ''} ${article.author.last_name || ''}`.trim()
            return name || article.author.email || 'Unknown'
        }
        return 'Unknown'
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Knowledgebase Management</CardTitle>
                    <CardDescription>Manage all knowledgebase content across the system</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/scouter/knowledgebase/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Article
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search articles by title or author..."
                            className="pl-8 max-w-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No articles found</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Scope</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredArticles.map((article) => (
                                    <TableRow key={article.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/knowledgebase/${article.slug}`} className="hover:underline text-primary" target="_blank">
                                                {article.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{getAuthorName(article)}</span>
                                                <span className="text-xs text-muted-foreground">{article.author?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {article.scope_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={article.published ? "default" : "secondary"}>
                                                {article.published ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(article.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => togglePublish(article.id, article.published)}
                                                >
                                                    {article.published ? "Unpublish" : "Publish"}
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/scouter/knowledgebase/${article.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => deleteArticle(article.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
