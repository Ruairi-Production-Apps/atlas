"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink, BookmarkX } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { SaveEventButton } from "../events/save-event-button"

interface SavedEvent {
    id: string
    created_at: string
    event: {
        id: string
        title: string
        slug: string
        start_date: string
        location: string | null
    }
}

interface SavedEventsProps {
    initialEvents: SavedEvent[]
    userId: string
}

export function SavedEvents({ initialEvents, userId }: SavedEventsProps) {
    if (initialEvents.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Saved Events</CardTitle>
                    <CardDescription>Events you've bookmarked for quick access</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No saved events yet</p>
                        <p className="text-sm">
                            Click the "Save Event" button on any event page to see it here.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Saved Events</CardTitle>
                <CardDescription>Events you've bookmarked for quick access</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialEvents.map((saved) => (
                            <TableRow key={saved.id}>
                                <TableCell className="font-medium">
                                    {saved.event.title}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {format(new Date(saved.event.start_date), 'MMM d, yyyy')}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {saved.event.location ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            {saved.event.location}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/events/${saved.event.slug}`}>
                                                View
                                                <ExternalLink className="h-4 w-4 ml-1" />
                                            </Link>
                                        </Button>
                                        <SaveEventButton
                                            eventId={saved.event.id}
                                            userId={userId}
                                            initialIsSaved={true}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
