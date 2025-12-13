"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Archive, Check, X, Eye, EyeOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    action_url: string | null
    is_read: boolean
    is_viewed: boolean
    is_archived: boolean
    created_at: string
}

export default function NotificationsPage() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        setLoading(true)
        const supabase = createClient()

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) {
            setNotifications(data)
        }
        setLoading(false)
    }

    const toggleRead = async (id: string, currentState: boolean) => {
        const supabase = createClient()
        await supabase
            .from('notifications')
            .update({
                is_read: !currentState,
                read_at: !currentState ? new Date().toISOString() : null
            })
            .eq('id', id)

        fetchNotifications()
    }

    const toggleArchive = async (id: string, currentState: boolean) => {
        const supabase = createClient()
        await supabase
            .from('notifications')
            .update({
                is_archived: !currentState,
                archived_at: !currentState ? new Date().toISOString() : null
            })
            .eq('id', id)

        fetchNotifications()
    }

    const markAllAsRead = async () => {
        const supabase = createClient()
        const unreadIds = filteredNotifications
            .filter(n => !n.is_read)
            .map(n => n.id)

        if (unreadIds.length > 0) {
            await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .in('id', unreadIds)

            fetchNotifications()
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'unread') return !n.is_read && !n.is_archived
        if (activeTab === 'archived') return n.is_archived
        return !n.is_archived // 'all' shows non-archived
    })

    const unreadCount = notifications.filter(n => !n.is_read && !n.is_archived).length

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Bell className="h-8 w-8" />
                        Notifications
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage all your notifications in one place
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Notifications</CardTitle>
                            {unreadCount > 0 && (
                                <Button onClick={markAllAsRead} variant="outline" size="sm">
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark all as read
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">
                                    All
                                    <Badge variant="secondary" className="ml-2">
                                        {notifications.filter(n => !n.is_archived).length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="unread">
                                    Unread
                                    {unreadCount > 0 && (
                                        <Badge variant="destructive" className="ml-2">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="archived">
                                    Archived
                                    <Badge variant="secondary" className="ml-2">
                                        {notifications.filter(n => n.is_archived).length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab}>
                                {loading ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Loading...
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg mb-2">No notifications</p>
                                        <p className="text-sm">
                                            {activeTab === 'unread' && 'You have no unread notifications'}
                                            {activeTab === 'archived' && 'You have no archived notifications'}
                                            {activeTab === 'all' && 'You have no notifications'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredNotifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'hover:bg-muted'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <button
                                                        onClick={() => router.push(`/notifications/${notification.id}`)}
                                                        className="text-left w-full group"
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                                                {notification.title}
                                                            </h3>
                                                            {!notification.is_read && (
                                                                <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                        </p>
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleRead(notification.id, notification.is_read)}
                                                        title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                                                    >
                                                        {notification.is_read ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleArchive(notification.id, notification.is_archived)}
                                                        title={notification.is_archived ? 'Unarchive' : 'Archive'}
                                                    >
                                                        {notification.is_archived ? (
                                                            <X className="h-4 w-4" />
                                                        ) : (
                                                            <Archive className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
