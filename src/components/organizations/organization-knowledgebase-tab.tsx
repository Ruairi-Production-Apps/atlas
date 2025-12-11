import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getKnowledgebaseArticles } from "@/lib/supabase/queries"
import { FileText, Tag } from "lucide-react"
import { AdventureSkillBadge } from "@/components/knowledgebase/adventure-skill-badge"
import { getOptimizedImageUrl } from "@/lib/utils"

interface OrganizationKnowledgebaseTabProps {
    scopeType: 'province' | 'county' | 'group'
    scopeId: string
}

export async function OrganizationKnowledgebaseTab({ scopeType, scopeId }: OrganizationKnowledgebaseTabProps) {
    // Filter by organization scope AND require show_on_org_page = true
    const articles = await getKnowledgebaseArticles({
        provinceId: scopeType === 'province' ? scopeId : undefined,
        countyId: scopeType === 'county' ? scopeId : undefined,
        groupId: scopeType === 'group' ? scopeId : undefined,
        showOnOrgPage: true
    })

    if (articles.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No knowledgebase articles found.</p>
                </CardContent>
            </Card>
        )
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not published'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
                <Link key={article.id} href={`/knowledgebase/${article.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col p-0 overflow-hidden">
                        <div className="relative aspect-video w-full bg-muted">
                            {article.featured_image_url ? (
                                <img
                                    src={getOptimizedImageUrl(article.featured_image_url, 75)}
                                    alt={article.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <FileText className="h-12 w-12 text-muted-foreground/20" />
                                </div>
                            )}
                        </div>
                        <CardHeader className="flex-1">
                            <CardTitle className="flex items-center gap-2 line-clamp-2">
                                {article.title}
                            </CardTitle>
                            <CardDescription>
                                {formatDate(article.published_at || article.created_at)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            {(article.description || article.body) && (
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                                    {article.description || article.body?.replace(/<[^>]*>/g, '').substring(0, 150)}
                                </p>
                            )}
                            <div className="flex flex-col gap-2 mt-auto">
                                {article.adventure_skill && (
                                    <div className="flex">
                                        <AdventureSkillBadge skill={article.adventure_skill} className="py-1 px-2 text-xs" />
                                    </div>
                                )}
                                {article.tags && article.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {article.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2 py-1 bg-muted rounded-full flex items-center gap-1"
                                            >
                                                <Tag className="h-3 w-3" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
