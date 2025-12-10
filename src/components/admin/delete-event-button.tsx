'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DeleteEventDialog } from './delete-event-dialog'
import { useToast } from '@/components/ui/use-toast'

interface DeleteEventButtonProps {
    eventId: string
    eventTitle: string
    scopeType: string
    scopeId: string
}

export function DeleteEventButton({
    eventId,
    eventTitle,
    scopeType,
    scopeId,
}: DeleteEventButtonProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await fetch(
                `/api/organizations/${scopeType}/${scopeId}/events/${eventId}`,
                {
                    method: 'DELETE',
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete event')
            }

            toast({
                title: "Event deleted successfully",
                description: `${eventTitle} has been removed.`,
            })
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast({
                title: "Error deleting event",
                description: error.message || 'Failed to delete event',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setOpen(true)}
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>

            <DeleteEventDialog
                open={open}
                onOpenChange={setOpen}
                eventTitle={eventTitle}
                onConfirm={handleDelete}
                loading={loading}
            />
        </>
    )
}
