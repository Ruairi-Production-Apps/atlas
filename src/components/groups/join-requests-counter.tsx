"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface JoinRequestsCounterProps {
    organizationId: string
    className?: string
}

export function JoinRequestsCounter({ organizationId, className }: JoinRequestsCounterProps) {
    const [count, setCount] = useState(0)

    const fetchCount = useCallback(async () => {
        try {
            const res = await fetch(`/api/organizations/group/${organizationId}/join-requests-count`)
            if (res.ok) {
                const data = await res.json()
                setCount(data.count || 0)
            }
        } catch (err) {
            console.error("Error fetching join requests count:", err)
        }
    }, [organizationId])

    useEffect(() => {
        fetchCount()

        const supabase = createClient()
        const channel = supabase
            .channel(`join_requests_count_${organizationId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'group_join_requests',
                    filter: `group_id=eq.${organizationId}`
                },
                () => {
                    fetchCount()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [organizationId, fetchCount])

    if (count === 0) return null

    return (
        <Badge
            className={cn(
                "bg-green-600 hover:bg-green-700 text-white rounded-full h-5 min-w-[20px] flex items-center justify-center p-1 text-[10px] border-2 border-background",
                className
            )}
        >
            {count}
        </Badge>
    )
}
