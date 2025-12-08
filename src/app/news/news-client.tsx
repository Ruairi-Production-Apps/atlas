'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Tag } from "lucide-react"
import { NewsPost } from "@/lib/supabase/queries"

interface NewsPageClientProps {
    initialNewsPosts: NewsPost[]
    initialProvinces: Array<{ id: string; name: string }>
    initialCounties: Array<{ id: string; name: string }>
    initialGroups: Array<{ id: string; name: string }>
}

export function NewsPageClient({
    initialNewsPosts,
    initialProvinces,
    initialCounties,
    initialGroups,
}: NewsPageClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const [newsPosts, setNewsPosts] = useState(initialNewsPosts)
    const [provinces] = useState(initialProvinces)
    const [counties, setCounties] = useState(initialCounties)
    const [groups, setGroups] = useState(initialGroups)

    const search = searchParams.get('search') || ''
    const provinceId = searchParams.get('provinceId') || ''
    const countyId = searchParams.get('countyId') || ''
    const groupId = searchParams.get('groupId') || ''
    const tag = searchParams.get('tag') || ''

    // Extract all unique tags from news posts
    const allTags = Array.from(
        new Set(newsPosts.flatMap(post => post.tags || []))
    ).sort()

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

        startTransition(() => {
            router.push(`/news?${params.toString()}`)
        })

        // Fetch new data
        try {
            const response = await fetch(`/api/news?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setNewsPosts(data.newsPosts || [])

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
            console.error('Failed to fetch news:', error)
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

    const handleTagChange = (value: string) => {
        updateFilters({ tag: value })
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
                    <img src="/images/atlas/news-badge.png" alt="News" className="h-12 w-12 object-contain" />
                    <h1 className="text-4xl font-bold">News</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-8">
                    Stay updated with the latest scouting news across Ireland
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
                                        placeholder="Search news..."
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
                                    <label className="text-sm font-medium mb-2 block">Tag</label>
                                    <select
                                        defaultValue={tag}
                                        onChange={(e) => handleTagChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">All Tags</option>
                                        {allTags.map((tagOption) => (
                                            <option key={tagOption} value={tagOption}>
                                                {tagOption}
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
                                    <Link href="/news">Clear</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* News List */}
                {isPending ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Loading...</p>
                        </CardContent>
                    </Card>
                ) : newsPosts.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No news posts found. Try adjusting your filters.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newsPosts.map((post) => (
                            <Link key={post.id} href={`/news/${post.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                                    {post.featured_image_url && (
                                        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                                            <img
                                                src={post.featured_image_url}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="flex-1">
                                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-2">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(post.published_at || post.created_at)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col">
                                        {(post.description || post.body) && (
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                                                {post.description || (post.body ? post.body.replace(/<[^>]*>/g, '').substring(0, 150) : '')}
                                            </p>
                                        )}
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {post.tags.slice(0, 3).map((tag) => (
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

