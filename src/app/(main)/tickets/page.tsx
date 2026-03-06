import { createClient } from '@/lib/supabase/server'
import { getTickets } from '@/lib/supabase/queries'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, MessageSquare, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'

export default async function TicketsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const tickets = await getTickets(user.id)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'default'
            case 'completed': return 'secondary' // or 'success' if available
            default: return 'outline'
        }
    }

    const getTypeLabel = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
                    <p className="text-muted-foreground">Manage your support requests and inquiries.</p>
                </div>
                <Button asChild>
                    <Link href="/tickets/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Ticket
                    </Link>
                </Button>
            </div>

            {tickets.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Tickets Found</CardTitle>
                        <CardDescription>You haven't submitted any support tickets yet.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-8">
                        <Button asChild variant="outline">
                            <Link href="/tickets/new">Create your first ticket</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket) => (
                        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">
                                            <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                                                {ticket.subject}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-xs">
                                            <span>Ticket #{ticket.id.slice(0, 8)}</span>
                                            <span>•</span>
                                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                        </CardDescription>
                                    </div>
                                    <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                                        {ticket.status === 'open' ? (
                                            <Clock className="mr-1 h-3 w-3 inline" />
                                        ) : (
                                            <CheckCircle className="mr-1 h-3 w-3 inline" />
                                        )}
                                        {ticket.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="flex gap-2 mb-2">
                                    <Badge variant="outline">{getTypeLabel(ticket.type)}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {ticket.description.replace(/<[^>]*>/g, '')}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" size="sm" asChild className="ml-auto">
                                    <Link href={`/tickets/${ticket.id}`}>
                                        View Details
                                        <MessageSquare className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
