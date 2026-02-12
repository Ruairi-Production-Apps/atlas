"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Bell, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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

export function NotificationsBell() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let channel: any

        const setup = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) return

            fetchNotifications()

            // Set up real-time subscription
            channel = supabase
                .channel('notifications')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${session.user.id}`
                    },
                    () => {
                        fetchNotifications()
                    }
                )
                .subscribe()
        }

        setup()

        return () => {
            if (channel) {
                const supabase = createClient()
                supabase.removeChannel(channel)
            }
        }
    }, [])

    const fetchNotifications = async () => {
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setNotifications([])
            setUnreadCount(0)
            return
        }

        // Get 3 most recent notifications
        const { data: recentNotifications, error: nError } = await supabase
            .from('notifications')
            .select('*')
            .eq('is_archived', false)
            .order('created_at', { ascending: false })
            .limit(3)

        if (nError) {
            console.error("Error fetching notifications:", {
                message: nError.message,
                code: nError.code,
                details: nError.details,
                hint: nError.hint
            })
        }

        // Get unread count
        const { count, error: cError } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .eq('is_archived', false)

        if (cError) {
            console.error("Error fetching unread count:", {
                message: cError.message,
                code: cError.code,
                details: cError.details,
                hint: cError.hint
            })
        }

        if (recentNotifications) {
            setNotifications(recentNotifications)
        }

        setUnreadCount(count || 0)
    }

    const handleNotificationClick = async (notification: Notification) => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // Mark as viewed and read
        await supabase
            .from('notifications')
            .update({
                is_viewed: true,
                is_read: true,
                viewed_at: new Date().toISOString(),
                read_at: new Date().toISOString()
            })
            .eq('id', notification.id)

        // Navigate to action URL or notification detail page
        if (notification.action_url) {
            router.push(notification.action_url)
        } else {
            router.push(`/notifications/${notification.id}`)
        }

        fetchNotifications()
    }

    const handleArchiveNotification = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        await supabase
            .from('notifications')
            .update({
                is_archived: true,
                archived_at: new Date().toISOString()
            })
            .eq('id', notificationId)

        fetchNotifications()
    }

    const handleMarkAllAsRead = async () => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)

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

    const markAllAsViewed = async () => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const notificationIds = notifications.filter(n => !n.is_viewed).map(n => n.id)

        if (notificationIds.length > 0) {
            await supabase
                .from('notifications')
                .update({
                    is_viewed: true,
                    viewed_at: new Date().toISOString()
                })
                .in('id', notificationIds)

            fetchNotifications()
        }
    }

    return (
        <DropdownMenu onOpenChange={(open) => { if (open) markAllAsViewed() }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full cursor-pointer">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-600 hover:bg-green-700 text-white border-2 border-background"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="px-1.5 py-0 h-5">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="relative flex flex-col items-start p-3 cursor-pointer group pr-10"
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start justify-between w-full gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                "text-sm truncate",
                                                notification.is_read ? "text-muted-foreground" : "font-semibold"
                                            )}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => handleArchiveNotification(e, notification.id)}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Dismiss</span>
                                </Button>
                            </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-center justify-center text-sm font-medium cursor-pointer"
                            onClick={() => router.push('/notifications')}
                        >
                            View all notifications
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
