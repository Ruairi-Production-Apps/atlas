'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, FileText, Loader2 } from 'lucide-react'
import { EventForm } from './event-form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface Event {
    id: string
    title: string
    slug: string
    featured_image_url: string | null
    body: string | null
    tags: string[]
    start_date: string
    end_date: string | null
    location: string | null
    price: number | null
    capacity_groups: number | null
    capacity_scouters: number | null
    capacity_youth: number | null
    visibility: 'open_to_all' | 'sections_only' | 'scouters_only'
    pricing_mode: 'per_group' | 'per_scout' | 'per_person_type' | null
    price_scouter: number | null
    price_youth: number | null
    require_participant_info: boolean
    require_payment: boolean
    category: 'youth_programme' | 'training' | 'national' | null
    is_all_day: boolean
    published: boolean
    published_at: string | null
    created_at: string
    updated_at: string
    google_map_link: string | null
    location_type: 'in_person' | 'online'
    online_meeting_link: string | null
}

interface OrganizationEventsTabProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team'
    organizationName: string
    isSysadmin?: boolean
}

export function OrganizationEventsTab({
    organizationId,
    organizationType,
    organizationName,
    isSysadmin = false,
}: OrganizationEventsTabProps) {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [formOpen, setFormOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [publishingId, setPublishingId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        loadEvents()
    }, [organizationId, organizationType])

    const loadEvents = async () => {
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events?includeUnpublished=true`
            )
            if (!response.ok) throw new Error('Failed to load events')
            const data = await response.json()
            setEvents(data.events || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (eventId: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events/${eventId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                    },
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete event')
            }

            toast({
                title: "Event deleted",
                description: "The event has been deleted successfully.",
            })

            await loadEvents()
        } catch (err: any) {
            setError(err.message)
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            })
        }
    }

    const handleTogglePublish = async (eventId: string, currentPublished: boolean) => {
        setPublishingId(eventId)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events/${eventId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                    },
                    body: JSON.stringify({ published: !currentPublished }),
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update event')
            }

            toast({
                title: currentPublished ? "Event unpublished" : "Event published",
                description: `The event has been ${currentPublished ? 'unpublished' : 'published'} successfully.`,
            })

            await loadEvents()
        } catch (err: any) {
            setError(err.message)
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setPublishingId(null)
        }
    }

    const handleFormSuccess = () => {
        setFormOpen(false)
        setEditingEvent(null)
        loadEvents()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Events</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage events for {organizationName}
                    </p>
                </div>
                <Button onClick={() => {
                    setEditingEvent(null)
                    setFormOpen(true)
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <p className="text-muted-foreground">Loading events...</p>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No events yet. Create your first one!</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">
                                            {event.title}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(event.start_date), 'PPP')}
                                                {event.end_date && (
                                                    <span className="text-muted-foreground">
                                                        {' - '}
                                                        {format(new Date(event.end_date), 'PPP')}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {event.location || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {event.price ? `€${event.price.toFixed(2)}` : 'Free'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={event.published ? 'default' : 'secondary'}>
                                                {event.published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={isSysadmin
                                                            ? `/admin/organizations/${organizationType}/${organizationId}/events/${event.id}/forms`
                                                            : `/scouter/organizations/${organizationId}/events/${event.id}/forms?type=${organizationType}`
                                                        }
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Manage Forms
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleTogglePublish(event.id, event.published)}
                                                    disabled={publishingId === event.id}
                                                >
                                                    {publishingId === event.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            {event.published ? 'Unpublishing...' : 'Publishing...'}
                                                        </>
                                                    ) : event.published ? (
                                                        <>
                                                            <EyeOff className="h-4 w-4 mr-2" />
                                                            Unpublish
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Publish
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingEvent(event)
                                                        setFormOpen(true)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(event.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent
                    className="max-h-[90vh] overflow-y-auto"
                    style={{ maxWidth: '95vw', width: '95vw' }}
                    onInteractOutside={(e) => {
                        // Prevent closing when clicking on flatpickr calendar
                        const target = e.target as HTMLElement
                        // Check if the click is on any flatpickr element
                        if (
                            target.closest('.flatpickr-calendar') ||
                            target.closest('.flatpickr-time') ||
                            target.closest('.flatpickr-day') ||
                            target.closest('.flatpickr-month') ||
                            target.closest('.flatpickr-year') ||
                            target.closest('.flatpickr-time input') ||
                            target.closest('.flatpickr-prev-month') ||
                            target.closest('.flatpickr-next-month') ||
                            target.closest('.flatpickr-current-month') ||
                            target.closest('.flatpickr-am-pm') ||
                            target.classList.contains('flatpickr-calendar') ||
                            target.classList.contains('flatpickr-time') ||
                            target.classList.contains('flatpickr-day') ||
                            target.classList.contains('flatpickr-month') ||
                            target.classList.contains('flatpickr-year')
                        ) {
                            e.preventDefault()
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {editingEvent ? 'Edit Event' : 'Create Event'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingEvent
                                ? 'Update the event details'
                                : 'Create a new event for ' + organizationName}
                        </DialogDescription>
                    </DialogHeader>
                    <EventForm
                        organizationId={organizationId}
                        organizationType={organizationType}
                        event={editingEvent}
                        onSuccess={handleFormSuccess}
                        onCancel={() => {
                            setFormOpen(false)
                            setEditingEvent(null)
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

