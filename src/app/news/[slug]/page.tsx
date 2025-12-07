import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getNewsPostBySlug } from "@/lib/supabase/queries"
import { Calendar, Tag } from "lucide-react"
import Link from "next/link"

export default async function NewsPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const post = await getNewsPostBySlug(slug)

    if (!post) {
        notFound()
    }

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

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/news">← Back to News</Link>
                    </Button>
                </div>

                {post.featured_image_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-8">
                        <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

                <div className="flex items-center gap-4 text-muted-foreground mb-8">
                    <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.published_at)}
                    </span>
                </div>

                {post.body && (
                    <Card className="mb-8">
                        <CardContent className="pt-6">
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: post.body }}
                            />
                        </CardContent>
                    </Card>
                )}

                {post.tags && post.tags.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
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

