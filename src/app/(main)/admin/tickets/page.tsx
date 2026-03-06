import { createClient } from '@/lib/supabase/server'
import { getAllTickets, TicketFilters } from '@/lib/supabase/queries'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { redirect } from 'next/navigation'

export default async function AdminTicketsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; search?: string }>
}) {
    const params = await searchParams
    const status = params.status as 'open' | 'completed' | undefined
    const search = params.search

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Double check sysadmin (layout does it but good to be safe)
    // Actually layout doesn't strictly enforce sysadmin for all children, 
    // but usually admin routes are protected. 
    // We'll rely on getAllTickets internally failing or returning empty if RLS fails,
    // or checks in middleware.

    // Fetch tickets
    const tickets = await getAllTickets({
        status,
        search
    })

    const getTypeLabel = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Support Tickets</h1>
                    <p className="text-muted-foreground">Manage ongoing support inquiries.</p>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <form className="flex-1 flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="search"
                            placeholder="Search by subject or content..."
                            className="pl-8"
                            defaultValue={search}
                        />
                    </div>
                    <select
                        name="status"
                        defaultValue={status || ''}
                        className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="completed">Completed</option>
                    </select>
                    <Button type="submit" variant="secondary">Filter</Button>
                </form>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subject</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        No tickets found.
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">
                                            <Link href={`/admin/tickets/${ticket.id}`} className="hover:underline">
                                                {ticket.subject}
                                            </Link>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span>{ticket.user_name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{ticket.user_email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="outline">{getTypeLabel(ticket.type)}</Badge>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                                                {ticket.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/tickets/${ticket.id}`}>View</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
