import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DeleteEventButton } from "@/components/admin/delete-event-button"

export default async function AdminEventsPage() {
    const supabase = await createClient()

    // Fetch all events
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Manage Events</h1>
                    <p className="text-muted-foreground">View all events and create National events</p>
                </div>
                <Button asChild>
                    <Link href="/admin/events/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create National Event
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Events</CardTitle>
                    <CardDescription>A list of all events across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Start Date</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {events?.map((event) => (
                                        <tr key={event.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle">{event.title}</td>
                                            <td className="p-4 align-middle capitalize">{event.scope_type === 'sitewide' ? 'National' : event.scope_type}</td>
                                            <td className="p-4 align-middle">{new Date(event.start_date).toLocaleDateString()}</td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${event.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {event.published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
                                                </Button>
                                                <DeleteEventButton
                                                    eventId={event.id}
                                                    eventTitle={event.title}
                                                    scopeType={event.scope_type}
                                                    scopeId={event.scope_id}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {!events?.length && (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                No events found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
