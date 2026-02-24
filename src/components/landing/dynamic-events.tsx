import { Event } from "@/lib/supabase/queries"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, MapPin, ArrowRight, Tent } from "lucide-react"

interface DynamicEventsProps {
    events: Event[]
}

export function DynamicEvents({ events }: DynamicEventsProps) {
    if (events.length === 0) return null

    return (
        <section className="py-20 bg-muted/10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <Tent className="h-4 w-4" />
                            Upcoming Activities
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Our Program & Events</h2>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/events">Full Calendar</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.slice(0, 3).map((event) => (
                        <Card key={event.id} className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-3">
                                    <Badge variant="secondary">
                                        {format(new Date(event.start_date), 'EEE d MMM')}
                                    </Badge>
                                    {event.price && (
                                        <span className="text-sm font-semibold">€{event.price}</span>
                                    )}
                                </div>
                                <Link href={`/events/${event.slug}`} className="hover:text-primary transition-colors">
                                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                                </Link>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{format(new Date(event.start_date), 'h:mm a')}{event.end_date ? ` - ${format(new Date(event.end_date), 'h:mm a')}` : ''}</span>
                                </div>
                                {event.location && (
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span className="line-clamp-1">{event.location}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-4 border-t">
                                <Button variant="ghost" size="sm" asChild className="p-0 h-auto font-semibold hover:bg-transparent hover:text-primary">
                                    <Link href={`/events/${event.slug}`} className="flex items-center gap-2">
                                        Event Details <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
