import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getKnowledgebaseArticles, getProvinces, getCounties, getGroups } from "@/lib/supabase/queries"
import { FileText, Tag } from "lucide-react"

interface KnowledgebasePageProps {
    searchParams: Promise<{
        search?: string
        provinceId?: string
        countyId?: string
        groupId?: string
        adventureSkill?: string
    }>
}

export default async function KnowledgebasePage({ searchParams }: KnowledgebasePageProps) {
    const params = await searchParams

    const filters = {
        search: params.search,
        provinceId: params.provinceId,
        countyId: params.countyId,
        groupId: params.groupId,
        adventureSkill: params.adventureSkill,
    }

    const articles = await getKnowledgebaseArticles(filters)
    const provinces = await getProvinces()
    const counties = params.provinceId ? await getCounties(params.provinceId) : []
    const groups = params.countyId ? await getGroups(params.countyId) : []

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
                        <form method="get" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Search</label>
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search articles..."
                                        defaultValue={params.search}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Province</label>
                                    <select
                                        name="provinceId"
                                        defaultValue={params.provinceId}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">All Provinces</option>
                                        {provinces.map((province) => (
                                            <option key={province.id} value={province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {params.provinceId && (
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">County</label>
                                        <select
                                            name="countyId"
                                            defaultValue={params.countyId}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="">All Counties</option>
                                            {counties.map((county) => (
                                                <option key={county.id} value={county.id}>
                                                    {county.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {params.countyId && (
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Group</label>
                                        <select
                                            name="groupId"
                                            defaultValue={params.groupId}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="">All Groups</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Adventure Skill</label>
                                    <select
                                        name="adventureSkill"
                                        defaultValue={params.adventureSkill}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">All Skills</option>
                                        {['Camping', 'Emergencies', 'Hillwalking', 'Backwoods', 'Pioneering', 'Rowing', 'Paddling', 'Air', 'Sailing'].map((skill) => (
                                            <option key={skill} value={skill}>
                                                {skill}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Apply Filters</Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/knowledgebase">Clear</Link>
                                </Button>
                            </div>
                        </form>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <Link key={article.id} href={`/knowledgebase/${article.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                                    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                                        {article.featured_image_url ? (
                                            <img
                                                src={article.featured_image_url}
                                                alt={article.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted">
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
                                                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                        {article.adventure_skill} Skills
                                                    </span>
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
                )}
            </div>
        </div>
    )
}

