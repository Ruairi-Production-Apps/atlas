"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Event } from "@/lib/supabase/queries"
import { CalendarView } from "./calendar-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Tag, LayoutGrid, LayoutList } from "lucide-react"
import { getOptimizedImageUrl } from "@/lib/utils"
import { format } from "date-fns"

interface EventsViewProps {
    events: Event[]
    defaultView?: 'grid' | 'calendar'
}

export function EventsView({ events, defaultView = 'calendar' }: EventsViewProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Initialize from URL param if present, strictly overriding defaultView prop if it exists in URL
    const viewParam = searchParams.get('view')
    const initialView = viewParam === 'grid' || viewParam === 'calendar' ? viewParam : defaultView

    const [viewMode, setViewMode] = useState<'grid' | 'calendar'>(initialView)

    // Sync state if URL changes externally (e.g. back button)
    useEffect(() => {
        const currentViewParam = searchParams.get('view')
        if ((currentViewParam === 'grid' || currentViewParam === 'calendar') && currentViewParam !== viewMode) {
            setViewMode(currentViewParam)
        }
    }, [searchParams, viewMode])

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

    const handleViewChange = (mode: 'grid' | 'calendar') => {
        setViewMode(mode)
        router.push(pathname + '?' + createQueryString('view', mode), { scroll: false })
    }
    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-2">
                <Button
                    variant={viewMode === 'grid' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleViewChange('grid')}
                >
                    <LayoutList className="h-4 w-4 mr-2" />
                    List View
                </Button>
                <Button
                    variant={viewMode === 'calendar' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleViewChange('calendar')}
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar View
                </Button>
            </div>

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
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
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
    )
}
