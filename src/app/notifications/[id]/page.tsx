import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function NotificationPage({
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

    const { data: notification, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !notification) {
        notFound()
    }

    // Mark as read and viewed
    await supabase
        .from('notifications')
        .update({
            is_read: true,
            is_viewed: true,
            read_at: new Date().toISOString(),
            viewed_at: new Date().toISOString()
        })
        .eq('id', id)

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/notifications">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Notifications
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-2xl">{notification.title}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                            </div>
                            <Badge variant={notification.is_read ? 'secondary' : 'default'}>
                                {notification.is_read ? 'Read' : 'Unread'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="prose max-w-none">
                            <p className="text-base">{notification.message}</p>
                        </div>

                        {notification.action_url && (
                            <div className="pt-4 border-t">
                                <Button asChild>
                                    <Link href={notification.action_url}>
                                        View Related Content
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-semibold mb-2">Additional Details</h3>
                                <div className="bg-muted p-3 rounded-md">
                                    <pre className="text-xs overflow-auto">
                                        {JSON.stringify(notification.metadata, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
