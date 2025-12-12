"use client"

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Tag } from "lucide-react"
import { KnowledgebaseArticle } from "@/lib/supabase/queries"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getOptimizedImageUrl } from "@/lib/utils"
import { AdventureSkillBadge } from "@/components/knowledgebase/adventure-skill-badge"
import { FileText } from "lucide-react"

interface KnowledgebaseClientProps {
    initialArticles: KnowledgebaseArticle[]
    initialProvinces: Array<{ id: string; name: string }>
    initialCounties: Array<{ id: string; name: string }>
    initialGroups: Array<{ id: string; name: string }>
    currentPage: number
    totalPages: number
}

export function KnowledgebaseClient({
    initialArticles,
    initialProvinces,
    initialCounties,
    initialGroups,
    currentPage,
    totalPages: initialTotalPages,
}: KnowledgebaseClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const [articles, setArticles] = useState(initialArticles)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [provinces] = useState(initialProvinces)
    const [counties, setCounties] = useState(initialCounties)
    const [groups, setGroups] = useState(initialGroups)

    const search = searchParams.get('search') || ''
    const provinceId = searchParams.get('provinceId') || ''
    const countyId = searchParams.get('countyId') || ''
    const groupId = searchParams.get('groupId') || ''
    const adventureSkill = searchParams.get('adventureSkill') || ''

    // Sync with server props
    useEffect(() => {
        setArticles(initialArticles)
        setTotalPages(initialTotalPages)
    }, [initialArticles, initialTotalPages])

    // Update filters and fetch new data
    const updateFilters = async (newFilters: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        // Reset dependent filters
        if (newFilters.provinceId !== undefined && !newFilters.provinceId) {
            params.delete('countyId')
            params.delete('groupId')
        }
        if (newFilters.countyId !== undefined && !newFilters.countyId) {
            params.delete('groupId')
        }

        // Reset page on filter change
        params.delete('page')

        startTransition(() => {
            router.push(`/knowledgebase?${params.toString()}`)
        })

        // Fetch new data for immediate updating
        try {
            const response = await fetch(`/api/knowledgebase?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setArticles(data.articles || [])
                setTotalPages(Math.ceil((data.count || 0) / 20))

                // Update counties if province changed
                if (newFilters.provinceId !== undefined) {
                    if (newFilters.provinceId) {
                        const countiesRes = await fetch(`/api/counties?provinceId=${newFilters.provinceId}`)
                        if (countiesRes.ok) {
                            const countiesData = await countiesRes.json()
                            setCounties(countiesData.counties || [])
                        }
                    } else {
                        setCounties([])
                    }
                }

                // Update groups if county changed
                if (newFilters.countyId !== undefined) {
                    if (newFilters.countyId) {
                        const groupsRes = await fetch(`/api/groups?countyId=${newFilters.countyId}`)
                        if (groupsRes.ok) {
                            const groupsData = await groupsRes.json()
                            setGroups(groupsData.groups || [])
                        }
                    } else {
                        setGroups([])
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch articles:', error)
        }
    }

    const handleSearchChange = (value: string) => {
        updateFilters({ search: value })
    }

    const handleProvinceChange = (value: string) => {
        updateFilters({ provinceId: value, countyId: '', groupId: '' })
    }

    const handleCountyChange = (value: string) => {
        updateFilters({ countyId: value, groupId: '' })
    }

    const handleGroupChange = (value: string) => {
        updateFilters({ groupId: value })
    }

    const handleSkillChange = (value: string) => {
        updateFilters({ adventureSkill: value })
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
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Search</label>
                                    <input
                                        type="text"
                                        placeholder="Search articles..."
                                        defaultValue={search}
                                        onChange={(e) => {
                                            if (searchTimeoutRef.current) {
                                                clearTimeout(searchTimeoutRef.current)
                                            }
                                            searchTimeoutRef.current = setTimeout(() => {
                                                handleSearchChange(e.target.value)
                                            }, 500)
                                        }}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Adventure Skill</label>
                                    <select
                                        defaultValue={adventureSkill}
                                        onChange={(e) => handleSkillChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">All Skills</option>
                                        {[
                                            'Camping',
                                            'Backwoods',
                                            'Pioneering',
                                            'Hillwalking',
                                            'Paddling',
                                            'Rowing',
                                            'Sailing',
                                            'Emergencies',
                                            'Air'
                                        ].map((skill) => (
                                            <option key={skill} value={skill}>
                                                {skill === 'Air' ? 'Air Activities' : skill}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Province</label>
                                    <select
                                        defaultValue={provinceId}
                                        onChange={(e) => handleProvinceChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">All Provinces</option>
                                        {provinces.map((province) => (
                                            <option key={province.id} value={province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {provinceId && (
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">County</label>
                                        <select
                                            defaultValue={countyId}
                                            onChange={(e) => handleCountyChange(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md"
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
                                {countyId && (
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Group</label>
                                        <select
                                            defaultValue={groupId}
                                            onChange={(e) => handleGroupChange(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md"
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
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/knowledgebase">Clear</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Articles List */}
                {isPending ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size={40} />
                            </div>
                        </CardContent>
                    </Card>
                ) : articles.length === 0 ? (
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
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col p-0 overflow-hidden group">
                                        <div className="relative h-48 w-full bg-muted">
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
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 line-clamp-2 text-lg">
                                                {article.title}
                                            </CardTitle>
                                            <CardDescription>
                                                {formatDate(article.published_at || article.created_at)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col p-6 pt-0">
                                            {(article.description || article.body) && (
                                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
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
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl="/knowledgebase"
                        />
                    </>
                )}
            </div>
        </div>
    )
}
