import { NewsPost } from "@/lib/supabase/queries"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, ArrowRight, Newspaper } from "lucide-react"

interface DynamicNewsProps {
    posts: NewsPost[]
    orgSlug: string
}

export function DynamicNews({ posts, orgSlug }: DynamicNewsProps) {
    if (posts.length === 0) return null

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <Newspaper className="h-4 w-4" />
                            Latest Updates
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">News & Announcements</h2>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/news">View All News</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.slice(0, 3).map((post) => (
                        <Card key={post.id} className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden">
                            {post.featured_image_url && (
                                <div className="aspect-video w-full overflow-hidden">
                                    <Link href={`/news/${post.slug}`}>
                                        <img
                                            src={post.featured_image_url}
                                            alt={post.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </Link>
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <Calendar className="h-3 w-3" />
                                    {post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'Recently'}
                                </div>
                                <Link href={`/news/${post.slug}`} className="hover:text-primary transition-colors">
                                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                </Link>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-muted-foreground text-sm line-clamp-3">
                                    {post.description}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-4 border-t">
                                <Button variant="ghost" size="sm" asChild className="p-0 h-auto font-semibold hover:bg-transparent hover:text-primary">
                                    <Link href={`/news/${post.slug}`} className="flex items-center gap-2">
                                        Read More <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
