import { createClient } from '@/lib/supabase/server'
import { getTicketById, getTicketReplies, getTicketAttachments } from '@/lib/supabase/queries'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react'
import { RichTextContent } from '@/components/ui/rich-text-content'
import { TicketReplyForm } from '@/components/tickets/ticket-reply-form'
import { closeTicket, reopenTicket } from '@/app/(main)/tickets/actions'

export default async function AdminTicketDetailPage({
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

    const replies = await getTicketReplies(id)
    const attachments = await getTicketAttachments(id)

    // Admin view can reply to any ticket

    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/tickets">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tickets List
                    </Link>
                </Button>
            </div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize text-xs">
                            {ticket.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Ticket #{ticket.id.slice(0, 8)}</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Submitted by <span className="font-semibold text-foreground">{ticket.user_name}</span> ({ticket.user_email})</span>
                        <span>•</span>
                        <span>{new Date(ticket.created_at).toLocaleString()}</span>
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
                            <Button variant="outline" size="sm">Mark Completed</Button>
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
                    <CardContent className="pt-4 space-y-4">
                        <RichTextContent content={ticket.description} />

                        {attachments.length > 0 && (
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold mb-2">Attachments</h4>
                                <div className="flex flex-wrap gap-2">
                                    {attachments.map((file) => (
                                        <Button key={file.id} variant="outline" size="sm" asChild className="gap-2 h-auto py-1">
                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                                <span className="truncate max-w-[150px]">{file.file_name}</span>
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1 min-w-0">
                                                    {(file.file_size ? file.file_size / 1024 : 0).toFixed(0)} KB
                                                </Badge>
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Replies */}
                {replies.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Activity Information</h3>
                        {replies.map((reply) => {
                            const isStaff = reply.user_id !== ticket.user_id

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
                <div className="pt-4">
                    <h3 className="text-lg font-semibold mb-4">Add a Reply</h3>
                    <TicketReplyForm ticketId={ticket.id} />
                </div>
            </div>
        </div>
    )
}
