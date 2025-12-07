'use client'

import { UserSubmission } from '@/lib/supabase/queries'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EventsListProps {
    submissions: UserSubmission[]
}

export function EventsList({ submissions }: EventsListProps) {
    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
                <h3 className="text-lg font-semibold">No Events Found</h3>
                <p className="text-muted-foreground mt-2">
                    You haven't signed up for any events yet.
                </p>
                <div className="mt-4">
                    <Button asChild variant="outline">
                        <Link href="/scouter/events">Browse Events</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Form</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {submissions.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell className="font-medium">
                                {sub.event_title}
                            </TableCell>
                            <TableCell>{sub.form_title}</TableCell>
                            <TableCell>
                                {format(new Date(sub.created_at), 'PPP')}
                            </TableCell>
                            <TableCell>
                                <Badge variant={sub.status === 'approved' ? 'default' : 'secondary'}>
                                    {sub.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {sub.payment_status === 'paid' ? (
                                    <Badge className="bg-green-600">Paid</Badge>
                                ) : sub.payment_status === 'pending' ? (
                                    <Badge variant="outline">Pending</Badge>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={`/events/${sub.event_slug}`}>
                                        View Event
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
