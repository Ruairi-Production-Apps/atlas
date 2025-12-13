"use client"

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Tag, LayoutList } from "lucide-react"
import { Event } from "@/lib/supabase/queries"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getOptimizedImageUrl } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarView } from "@/components/events/calendar-view"
import { FlatpickrDateInput } from "@/components/ui/flatpickr-date-input"

interface EventsClientProps {
    initialEvents: Event[]
    initialProvinces: Array<{ id: string; name: string }>
    initialCounties: Array<{ id: string; name: string }>
    initialGroups: Array<{ id: string; name: string }>
    currentPage: number
    totalPages: number
}

export function EventsClient({
    initialEvents,
    initialProvinces,
    initialCounties,
    initialGroups,
    currentPage,
    totalPages: initialTotalPages,
}: EventsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Use server props directly - no local state needed
    const events = initialEvents
    const totalPages = initialTotalPages
    const [provinces] = useState(initialProvinces)
    const [counties, setCounties] = useState(initialCounties)
    const [groups, setGroups] = useState(initialGroups)
    const initialView = searchParams.get('view')
    const [viewMode, setViewMode] = useState<'grid' | 'calendar'>(
        (initialView === 'grid' || initialView === 'list') ? 'grid' : 'calendar'
    )

    const search = searchParams.get('search') || ''
    const provinceId = searchParams.get('provinceId') || ''
    const countyId = searchParams.get('countyId') || ''
    const groupId = searchParams.get('groupId') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const visibility = searchParams.get('visibility') || ''

    const section = searchParams.get('section') || ''

    // Sync counties and groups with server props
    useEffect(() => {
        setCounties(initialCounties)
        setGroups(initialGroups)
    }, [initialCounties, initialGroups])

    // Update filters and fetch new data through server navigation
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
        if (newFilters.visibility !== undefined && newFilters.visibility !== 'sections_only') {
            params.delete('section')
        }

        // Reset page on filter change
        params.delete('page')

        startTransition(() => {
            router.push(`/events?${params.toString()}`)
        })
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

    const handleDateFromChange = (value: string) => {
        updateFilters({ dateFrom: value })
    }

    const handleDateToChange = (value: string) => {
        updateFilters({ dateTo: value })
    }

    const handleVisibilityChange = (value: string) => {
        updateFilters({ visibility: value, section: '' })
    }

    const handleSectionChange = (value: string) => {
        updateFilters({ section: value === section ? '' : value })
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <img src="/images/atlas/events-badge.png" alt="Events" className="h-12 w-12 object-contain" />
                            <h1 className="text-4xl font-bold">Events</h1>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Discover upcoming scouting events across Ireland
                        </p>
                    </div>
                </div>

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
                                        placeholder="Search events..."
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
                                    <label className="text-sm font-medium mb-2 block">Date From</label>
                                    <FlatpickrDateInput
                                        value={dateFrom}
                                        onChange={(_, dateStr) => handleDateFromChange(dateStr)}
                                        placeholder="Select date..."
                                        options={{
                                            enableTime: false,
                                            dateFormat: "Y-m-d",
                                            altFormat: "d/m/Y",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Date To</label>
                                    <FlatpickrDateInput
                                        value={dateTo}
                                        onChange={(_, dateStr) => handleDateToChange(dateStr)}
                                        placeholder="Select date..."
                                        options={{
                                            enableTime: false,
                                            dateFormat: "Y-m-d",
                                            altFormat: "d/m/Y",
                                        }}
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
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Participants</label>
                                    <select
                                        defaultValue={visibility}
                                        onChange={(e) => handleVisibilityChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">All Participants</option>
                                        <option value="open_to_all">Open to All</option>
                                        <option value="sections_only">Youth Members</option>
                                        <option value="scouters_only">Scouters Only</option>
                                    </select>
                                </div>
                            </div>

                            {/* Section Filters */}
                            {visibility === 'sections_only' && (
                                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="text-sm font-medium mb-2 block">Filter by Section</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { label: 'Beavers', value: 'beavers' },
                                            { label: 'Cubs', value: 'cubs' },
                                            { label: 'Scouts', value: 'scouts' },
                                            { label: 'Ventures', value: 'ventures' },
                                            { label: 'Rovers', value: 'rovers' }
                                        ].map((item) => (
                                            <button
                                                key={item.value}
                                                onClick={() => handleSectionChange(item.value)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${section === item.value
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-background hover:bg-muted text-foreground border-border'
                                                    }`}
                                            >
                                                <img
                                                    src={`/images/scouting_ireland/${item.label} Logo.png`}
                                                    alt={item.label}
                                                    className="w-6 h-6 object-contain"
                                                />
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/events">Clear</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div className="flex justify-end gap-2">
                        <Button
                            variant={viewMode === 'grid' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutList className="h-4 w-4 mr-2" />
                            List View
                        </Button>
                        <Button
                            variant={viewMode === 'calendar' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Calendar View
                        </Button>
                    </div>

                    <div className="space-y-6 relative">
                        {/* Subtle loading overlay */}
                        {isPending && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 rounded-lg flex items-center justify-center">
                                <LoadingSpinner size={32} />
                            </div>
                        )}

                        {/* Content with reduced opacity during loading */}
                        <div className={isPending ? "opacity-40 pointer-events-none" : ""}>
                            {viewMode === 'calendar' ? (
                                <CalendarView events={events} />
                            ) : (
                                <>
                                    {events.length === 0 ? (
                                        <Card>
                                            <CardContent className="py-12 text-center">
                                                <p className="text-muted-foreground">
                                                    No events found. Try adjusting your filters.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {events.map((event) => (
                                                <Link key={event.id} href={`/events/${event.slug}`}>
                                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer p-0 gap-0 border-0 overflow-hidden ring-1 ring-border">
                                                        {event.featured_image_url && (
                                                            <div className="aspect-video w-full overflow-hidden bg-muted">
                                                                <img
                                                                    src={getOptimizedImageUrl(event.featured_image_url, 75)}
                                                                    alt={event.title}
                                                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="p-6 gap-4">
                                                            <CardHeader className="p-0">
                                                                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                                                                <CardDescription className="flex flex-col gap-2 mt-2">
                                                                    <span className="flex items-start gap-1">
                                                                        <Calendar className="h-4 w-4 shrink-0 mt-0.5" />
                                                                        {format(new Date(event.start_date), 'EEE PPP')}
                                                                        {event.end_date && ` to ${format(new Date(event.end_date), 'EEE PPP')}`}
                                                                    </span>
                                                                    {event.location && (
                                                                        <span className="flex items-center gap-1">
                                                                            <MapPin className="h-4 w-4" />
                                                                            {event.location}
                                                                        </span>
                                                                    )}
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="p-0 mt-4">
                                                                {event.body && (
                                                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                                                        {event.body.replace(/<[^>]*>/g, ' ').substring(0, 150)}
                                                                    </p>
                                                                )}
                                                                {event.tags && event.tags.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {event.tags.slice(0, 3).map((tag) => (
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
                                                                {event.price && (
                                                                    <p className="text-sm font-medium mt-2">
                                                                        €{event.price.toFixed(2)}
                                                                    </p>
                                                                )}
                                                            </CardContent>
                                                        </div>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {!isPending && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl="/events"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
