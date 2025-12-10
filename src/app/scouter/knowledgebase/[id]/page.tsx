"use client"

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default function ViewKnowledgebaseArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const supabase = createClient()
    const [article, setArticle] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('knowledgebase_articles')
                .select('*, knowledgebase_files(*), profiles:author_id(first_name, last_name)')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching article:', error)
            } else {
                setArticle(data)
            }
            setLoading(false)
        }

        fetchArticle()
    }, [id, supabase])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size={40} />
            </div>
        )
    }

    if (!article) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
                <h1 className="text-2xl font-bold">Article not found</h1>
                <Button variant="ghost" className="mt-4" asChild>
                    <Link href="/dashboard?tab=knowledgebase">Back to Knowledgebase</Link>
                </Button>
            </div>
        )
    }

    const embeddedFiles = article.knowledgebase_files?.filter((f: any) => f.is_embedded) || []
    const allFiles = article.knowledgebase_files || []

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/dashboard?tab=knowledgebase">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Knowledgebase
                    </Link>
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
                        <div className="flex gap-2 mb-4">
                            <Badge variant="outline">{article.scope_type}</Badge>
                            {article.section_types?.map((s: string) => (
                                <Badge key={s} variant="secondary">{s}</Badge>
                            ))}
                            {!article.published && <Badge variant="secondary">Draft</Badge>}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/scouter/knowledgebase/${article.id}/edit`}>Edit Article</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardContent className="pt-6">
                        {/* Short Description */}
                        {article.description && (
                            <div className="text-lg text-muted-foreground mb-6 border-b pb-4">
                                {article.description}
                            </div>
                        )}

                        {/* Rich Text Body */}
                        <div
                            className="prose max-w-none dark:prose-invert mb-8"
                            dangerouslySetInnerHTML={{ __html: article.body }}
                        />

                        {/* Embedded Files */}
                        {embeddedFiles.length > 0 && (
                            <div className="space-y-8 my-8">
                                {embeddedFiles.map((file: any) => (
                                    <div key={file.id} className="border rounded-lg overflow-hidden">
                                        {file.mime_type?.includes('image') ? (
                                            <div className="bg-muted/20 p-4 flex justify-center">
                                                <img
                                                    src={file.file_url}
                                                    alt={file.file_name}
                                                    className="max-h-[600px] object-contain"
                                                />
                                            </div>
                                        ) : (file.mime_type?.includes('pdf') || file.file_name?.toLowerCase().endsWith('.pdf')) ? (
                                            <object
                                                data={file.file_url}
                                                type="application/pdf"
                                                className="w-full h-[800px]"
                                            >
                                                <div className="flex flex-col items-center justify-center h-48 bg-muted text-muted-foreground p-4 text-center">
                                                    <p>Unable to display PDF directly.</p>
                                                    <Button variant="link" asChild className="mt-2">
                                                        <a href={file.file_url} target="_blank" rel="noreferrer">Download File</a>
                                                    </Button>
                                                </div>
                                            </object>
                                        ) : (
                                            <div className="p-4 bg-muted text-center">
                                                <p>Preview not available for {file.file_name}</p>
                                            </div>
                                        )}
                                        <div className="bg-muted/50 p-2 text-center text-xs text-muted-foreground border-t">
                                            {file.file_name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* All Attachments Download List */}
                        {allFiles.length > 0 && (
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                                <div className="grid gap-2">
                                    {allFiles.map((file: any) => (
                                        <a
                                            key={file.id}
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                                <span className="font-medium text-sm">{file.file_name}</span>
                                            </div>
                                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
