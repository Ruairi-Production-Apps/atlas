"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Bell } from "lucide-react"
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
    created_at: string
}

export function NotificationsBell() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchNotifications()

        // Set up real-time subscription
        const supabase = createClient()
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications'
                },
                () => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchNotifications = async () => {
        const supabase = createClient()

        // Get 3 most recent notifications
        const { data: recentNotifications } = await supabase
            .from('notifications')
            .select('*')
            .eq('is_archived', false)
            .order('created_at', { ascending: false })
            .limit(3)

        // Get unread count
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .eq('is_archived', false)

        if (recentNotifications) {
            setNotifications(recentNotifications)
        }

        setUnreadCount(count || 0)
    }

    const handleNotificationClick = async (notification: Notification) => {
        const supabase = createClient()

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

    const markAllAsViewed = async () => {
        const supabase = createClient()
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
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {unreadCount} new
                        </Badge>
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
                                className="flex flex-col items-start p-3 cursor-pointer"
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start justify-between w-full gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm truncate">
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
