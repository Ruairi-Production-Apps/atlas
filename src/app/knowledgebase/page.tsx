import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getKnowledgebaseArticlesPaginated, getProvinces, getCounties, getGroups } from "@/lib/supabase/queries"
import { FileText, Tag } from "lucide-react"
import { PaginationControls } from "@/components/ui/pagination-controls"

interface KnowledgebasePageProps {
    searchParams: Promise<{
        search?: string
        provinceId?: string
        countyId?: string
        groupId?: string
        adventureSkill?: string
        page?: string
    }>
}

import { KnowledgebaseFilter } from "@/components/knowledgebase/knowledgebase-filter"
import { AdventureSkillBadge } from "@/components/knowledgebase/adventure-skill-badge"
import { getOptimizedImageUrl } from "@/lib/utils"

export default async function KnowledgebasePage({ searchParams }: KnowledgebasePageProps) {
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const limit = 20

    const filters = {
        search: params.search,
        provinceId: params.provinceId,
        countyId: params.countyId,
        groupId: params.groupId,
        adventureSkill: params.adventureSkill,
    }

    const { data: articles, count } = await getKnowledgebaseArticlesPaginated(filters, page, limit)
    const provinces = await getProvinces()
    const counties = params.provinceId ? await getCounties(params.provinceId) : []
    const groups = params.countyId ? await getGroups(params.countyId) : []

    const totalPages = Math.ceil(count / limit)

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
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <img src="/images/atlas/knowledgebase-badge.png" alt="Knowledgebase" className="h-12 w-12 object-contain" />
                    <h1 className="text-4xl font-bold">Knowledgebase</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-8">
                    Access resources and documentation from scouting organizations
                </p>

                {/* Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <KnowledgebaseFilter
                            provinces={provinces}
                            counties={counties}
                            groups={groups}
                        />
                    </CardContent>
                </Card>

                {/* Articles List */}
                {articles.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No articles found. Try adjusting your filters.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                            <CardTitle className="flex items-center gap-2">
                                                {/* Icon removed from title since we have image now */}
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
                        <PaginationControls
                            currentPage={page}
                            totalPages={totalPages}
                            baseUrl="/knowledgebase"
                        />
                    </>
                )}
            </div>
        </div>
    )
}

