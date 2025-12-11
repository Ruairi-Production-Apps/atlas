import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getNewsPostBySlug } from "@/lib/supabase/queries"
import { Calendar, Tag } from "lucide-react"
import Link from "next/link"
import { createClient } from '@/lib/supabase/server'
import { EditLink } from '@/components/ui/edit-link'
import { getOptimizedImageUrl } from "@/lib/utils"

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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let canEdit = false
    let editUrl = ''

    if (user) {
        // Check permissions
        const { checkOrganizationPermission } = await import('@/lib/auth-utils')

        // Handle sitewide (national) news
        if ((post.scope_type as string) === 'sitewide') {
            const { data: sysadminRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'sysadmin')
                .maybeSingle()

            if (sysadminRole) {
                canEdit = true
                editUrl = `/admin/news/${post.id}/edit`
            }
        } else {
            // Handle organization news
            canEdit = await checkOrganizationPermission(
                supabase,
                user.id,
                post.scope_type,
                post.scope_id,
                'can_manage_news'
            )

            if (canEdit) {
                // If sysadmin, use admin route, otherwise use dashboard route
                const { data: sysadminRole } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .eq('role', 'sysadmin')
                    .maybeSingle()

                if (sysadminRole) {
                    editUrl = `/admin/news/${post.id}/edit`
                } else {
                    editUrl = `/dashboard/${post.scope_type}/${post.scope_id}/news/${post.id}/edit`
                }
            }
        }
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
                            src={getOptimizedImageUrl(post.featured_image_url, 80)}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="flex flex-col gap-1 mb-4">
                    <h1 className="text-4xl font-bold">{post.title}</h1>
                    {canEdit && (
                        <EditLink href={editUrl} />
                    )}
                </div>

                <div className="flex items-center gap-4 text-muted-foreground mb-8">
                    <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.published_at || post.created_at)}
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

