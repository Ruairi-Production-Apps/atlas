"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Search } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface KnowledgebaseManagerProps {
    user: any
    organizations: any[]
}

export function KnowledgebaseManager({ user, organizations }: KnowledgebaseManagerProps) {
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true)
            try {
                // Fetch articles authored by the user
                const { data, error } = await supabase
                    .from('knowledgebase_articles')
                    .select('*')
                    .eq('author_id', user.id)
                    .order('created_at', { ascending: false })

                if (error) {
                    console.error('Error fetching knowledgebase articles:', error)
                } else {
                    setArticles(data || [])
                }
            } catch (err) {
                console.error('Unexpected error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchArticles()
    }, [user.id, supabase])

    const togglePublish = async (articleId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('knowledgebase_articles')
            .update({ published: !currentStatus })
            .eq('id', articleId)

        if (!error) {
            setArticles(articles.map(a =>
                a.id === articleId ? { ...a, published: !currentStatus } : a
            ))
        }
    }

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Knowledgebase Articles</CardTitle>
                    <CardDescription>Manage your knowledgebase content here</CardDescription>
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
                            placeholder="Search articles..."
                            className="pl-8 max-w-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size={40} />
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No articles found</p>
                        <p className="text-sm">
                            {searchQuery ? "No articles match your search." : "You haven't created any knowledgebase articles yet."}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
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
                                        <Link href={`/scouter/knowledgebase/${article.id}`} className="hover:underline text-primary">
                                            {article.title}
                                        </Link>
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
                                                    Edit
                                                </Link>
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
    )
}
