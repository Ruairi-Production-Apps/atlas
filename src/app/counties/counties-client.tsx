"use client"

import { useState, useTransition, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { County, Province } from "@/lib/supabase/queries"

interface CountiesClientProps {
    initialCounties: County[]
    initialProvinces: Province[]
}

export function CountiesClient({
    initialCounties,
    initialProvinces
}: CountiesClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const [counties, setCounties] = useState<County[]>(initialCounties)

    const search = searchParams.get('search') || ''
    const provinceId = searchParams.get('provinceId') || ''

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
            router.push(`/counties?${params.toString()}`, { scroll: false })
        })

        // Fetch new data
        try {
            const response = await fetch(`/api/counties?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setCounties(data.counties || [])
            }
        } catch (error) {
            console.error('Failed to fetch counties:', error)
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

    const handleProvinceChange = (value: string) => {
        updateFilters({ provinceId: value })
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <img src="/images/atlas/counties-badge.png" alt="Counties" className="h-12 w-12 object-contain" />
                    <h1 className="text-4xl font-bold">Counties</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-12">
                    Find scouting counties across Ireland
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
                                        placeholder="Search counties..."
                                        defaultValue={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Province</label>
                                    <select
                                        defaultValue={provinceId}
                                        onChange={(e) => handleProvinceChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">All Provinces</option>
                                        {initialProvinces.map((province) => (
                                            <option key={province.id} value={province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/counties">Clear</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Counties List */}
                {isPending ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size={40} />
                            </div>
                        </CardContent>
                    </Card>
                ) : counties.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No counties found. Try adjusting your filters.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {counties.map((county) => (
                            <Link key={county.id} href={`/counties/${county.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            {county.logo_url && (
                                                <img
                                                    src={county.logo_url}
                                                    alt={`${county.name} logo`}
                                                    className="w-16 h-16 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <CardTitle>{county.name}</CardTitle>
                                                {county.description && (
                                                    <CardDescription className="line-clamp-2">
                                                        {county.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {(county.email || county.website) && (
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                {county.email && <p>Email: {county.email}</p>}
                                                {county.website && <p>Website: {county.website}</p>}
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
