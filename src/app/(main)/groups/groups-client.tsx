"use client"

import { useState, useTransition, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Group, County } from "@/lib/supabase/queries"

interface GroupsClientProps {
    initialGroups: Group[]
    initialCounties: County[]
}

export function GroupsClient({
    initialGroups,
    initialCounties
}: GroupsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const [groups, setGroups] = useState<Group[]>(initialGroups)

    const search = searchParams.get('search') || ''
    const countyId = searchParams.get('countyId') || ''

    const updateFilters = async (newFilters: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        startTransition(() => {
            router.push(`/groups?${params.toString()}`, { scroll: false })
        })

        // Fetch new data
        try {
            const response = await fetch(`/api/groups?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setGroups(data.groups || [])
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error)
        }
    }

    const handleSearchChange = (value: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
        searchTimeoutRef.current = setTimeout(() => {
            updateFilters({ search: value })
        }, 300)
    }

    const handleCountyChange = (value: string) => {
        updateFilters({ countyId: value })
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <img src="/images/atlas/groups-badge.png" alt="Groups" className="h-12 w-12 object-contain" />
                    <h1 className="text-4xl font-bold">Groups</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-12">
                    Connect with local scouting groups
                </p>

                {/* Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Search</label>
                                    <input
                                        type="text"
                                        placeholder="Search groups..."
                                        defaultValue={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">County</label>
                                    <select
                                        defaultValue={countyId}
                                        onChange={(e) => handleCountyChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">All Counties</option>
                                        {initialCounties.map((county) => (
                                            <option key={county.id} value={county.id}>
                                                {county.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/groups">Clear</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Groups List */}
                {isPending ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size={40} />
                            </div>
                        </CardContent>
                    </Card>
                ) : groups.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No groups found. Try adjusting your filters.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groups.map((group) => (
                            <Link key={group.id} href={`/groups/${group.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            {group.logo_url && (
                                                <img
                                                    src={group.logo_url}
                                                    alt={`${group.name} logo`}
                                                    className="w-16 h-16 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <CardTitle>{group.name}</CardTitle>
                                                {group.description && (
                                                    <CardDescription className="line-clamp-2">
                                                        {group.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {(group.email || group.website) && (
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                {group.email && <p>Email: {group.email}</p>}
                                                {group.website && <p>Website: {group.website}</p>}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
