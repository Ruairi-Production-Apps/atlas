"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface SaveEventButtonProps {
    eventId: string
    initialIsSaved?: boolean
    userId?: string
}

export function SaveEventButton({ eventId, initialIsSaved = false, userId }: SaveEventButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        setIsSaved(initialIsSaved)
    }, [initialIsSaved])

    const handleToggleSave = async () => {
        if (!userId) {
            toast({
                title: "Log in required",
                description: "You must be logged in to save events.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            if (isSaved) {
                // Un-save: Delete record
                const { error } = await supabase
                    .from('user_saved_events')
                    .delete()
                    .eq('user_id', userId)
                    .eq('event_id', eventId)

                if (error) throw error

                setIsSaved(false)
                toast({
                    title: "Event removed",
                    description: "The event has been removed from your saved events.",
                })
            } else {
                // Save: Insert record
                const { error } = await supabase
                    .from('user_saved_events')
                    .insert({
                        user_id: userId,
                        event_id: eventId,
                    })

                if (error) throw error

                setIsSaved(true)
                toast({
                    title: "Event saved",
                    description: "The event has been added to your saved events.",
                })
            }

            // Refresh to update dashboard if this is called from there
            router.refresh()
        } catch (error: any) {
            console.error('Error toggling save:', error)
            toast({
                title: "Error",
                description: error.message || "Failed to save event. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSave}
            disabled={loading}
            className={cn(
                "gap-2",
                isSaved && "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            )}
        >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
            {isSaved ? "Saved" : "Save Event"}
        </Button>
    )
}
