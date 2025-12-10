import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getKnowledgebaseArticleBySlug, getKnowledgebaseFiles } from "@/lib/supabase/queries"
import { FileText, Tag, Download } from "lucide-react"
import Link from "next/link"

export default async function KnowledgebaseArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const article = await getKnowledgebaseArticleBySlug(slug)

    if (!article) {
        notFound()
    }

    const files = await getKnowledgebaseFiles(article.id)

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not published'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return 'Unknown size'
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/knowledgebase">← Back to Knowledgebase</Link>
                    </Button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-6 w-6" />
                    <h1 className="text-4xl font-bold">{article.title}</h1>
                </div>

                {article.featured_image_url && (
                    <div className="mb-6 rounded-lg overflow-hidden border">
                        <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover max-h-[400px]"
                        />
                    </div>
                )}

                <div className="text-muted-foreground mb-8">
                    Published: {formatDate(article.published_at || article.created_at)}
                </div>

                {article.body ? (
                    <Card className="mb-8">
                        <CardContent className="pt-6">
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: article.body }}
                            />
                        </CardContent>
                    </Card>
                ) : article.description ? (
                    <Card className="mb-8">
                        <CardContent className="pt-6">
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {article.description}
                            </p>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Embedded Files */}
                {files.filter((f) => f.is_embedded).length > 0 && (
                    <div className="space-y-8 mb-8">
                        {files.filter((f) => f.is_embedded).map((file) => (
                            <div key={file.id} className="border rounded-lg overflow-hidden bg-background">
                                {file.mime_type?.includes('image') ? (
                                    <div className="bg-muted/20 p-4 flex justify-center">
                                        <img
                                            src={file.file_url}
                                            alt={file.file_name}
                                            className="max-h-[800px] object-contain"
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
                                        <Button variant="link" asChild className="mt-2">
                                            <a href={file.file_url} target="_blank" rel="noreferrer">Download File</a>
                                        </Button>
                                    </div>
                                )}
                                <div className="bg-muted/50 p-2 text-center text-xs text-muted-foreground border-t">
                                    {file.file_name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {files.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Attachments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {files.map((file) => (
                                    <a
                                        key={file.id}
                                        href={file.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{file.file_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatFileSize(file.file_size)} • {file.mime_type || 'Unknown type'}
                                                </p>
                                            </div>
                                        </div>
                                        <Download className="h-5 w-5 text-muted-foreground" />
                                    </a>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {article.tags && article.tags.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {article.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-sm px-3 py-1 bg-muted rounded-full flex items-center gap-1"
                                    >
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

