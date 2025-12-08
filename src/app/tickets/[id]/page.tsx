import { createClient } from '@/lib/supabase/server'
import { getTicketById, getTicketReplies } from '@/lib/supabase/queries'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react'
import { RichTextContent } from '@/components/ui/rich-text-content'
import { TicketReplyForm } from '@/components/tickets/ticket-reply-form'
import { closeTicket, reopenTicket } from '@/app/tickets/actions'

export default async function TicketPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const ticket = await getTicketById(id)

    if (!ticket) {
        notFound()
    }

    // Basic ownership check - actual security enforced by RLS but good for UX
    // Since getTicketById fetches everything, we can query safely.
    // However, if RLS prevented access, getTicketById would return null for a restricted DB fetch,
    // or if using service role, we'd need to check.
    // The current getTicketById uses the server client which has user context.
    // So if ticket is returned, user is allowed to see it.

    const replies = await getTicketReplies(id)

    const isAuthor = ticket.user_id === user.id

    // Check if sysadmin for "Staff" badge
    const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()
    const isSysadmin = !!roles

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="mb-6">
                <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/tickets">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tickets
                    </Link>
                </Button>
            </div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>#{ticket.id.slice(0, 8)}</span>
                        <span>{new Date(ticket.created_at).toLocaleString()}</span>
                        <Badge variant="outline" className="capitalize">
                            {ticket.type.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'} className="text-sm py-1 px-3">
                        {ticket.status === 'open' ? (
                            <Clock className="mr-1 h-3 w-3 inline" />
                        ) : (
                            <CheckCircle className="mr-1 h-3 w-3 inline" />
                        )}
                        {ticket.status.toUpperCase()}
                    </Badge>

                    {ticket.status === 'open' ? (
                        <form action={closeTicket.bind(null, ticket.id)}>
                            <Button variant="outline" size="sm">Mark Method Completed</Button>
                        </form>
                    ) : (
                        <form action={reopenTicket.bind(null, ticket.id)}>
                            <Button variant="outline" size="sm">Re-open Ticket</Button>
                        </form>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                {/* Original Post */}
                <Card className="border-l-4 border-l-primary/50">
                    <CardHeader className="pb-3 bg-muted/20">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{ticket.user_name || 'User'}</span>
                                <span className="text-xs text-muted-foreground">Original Poster</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <RichTextContent content={ticket.description} />
                    </CardContent>
                </Card>

                {/* Replies */}
                {replies.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Activity</h3>
                        {replies.map((reply) => {
                            const isStaff = reply.user_id !== ticket.user_id // Simplified Assumption for now or fetch role
                            // In a real system, we'd check if reply.user_id has sysadmin role
                            // For now, let's assume anyone not the OP is staff/support if the ticket is support

                            return (
                                <Card key={reply.id} className={isStaff ? "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10" : "bg-muted/10"}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{reply.user_name || 'User'}</span>
                                                {isStaff && (
                                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-none">
                                                        Staff
                                                    </Badge>
                                                )}
                                                {!isStaff && reply.user_id === ticket.user_id && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Author
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(reply.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <RichTextContent content={reply.message} />
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Reply Form */}
                {ticket.status === 'open' ? (
                    <div className="pt-4">
                        <h3 className="text-lg font-semibold mb-4">Add a Reply</h3>
                        <TicketReplyForm ticketId={ticket.id} />
                    </div>
                ) : (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <CheckCircle className="h-8 w-8 mb-2 opacity-50" />
                            <p>This ticket is marked as completed.</p>
                            <p className="text-sm">Re-open the ticket to add a new reply.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
