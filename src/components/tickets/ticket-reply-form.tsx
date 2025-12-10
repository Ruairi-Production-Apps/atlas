'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Send } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { submitReply } from '@/app/tickets/actions'

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState('')
    const { toast } = useToast()

    async function handleSubmit(formData: FormData) {
        if (!message.trim()) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Message cannot be empty.",
            })
            return
        }

        setIsSubmitting(true)
        formData.append('ticketId', ticketId)
        formData.append('message', message)

        try {
            await submitReply(formData)
            setMessage('') // Clear form
            toast({
                title: "Reply sent",
                description: "Your reply has been added to the ticket.",
            })
        } catch (error) {
            console.error(error)
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to send reply. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="border rounded-md">
                <RichTextEditor
                    content={message}
                    onChange={setMessage}
                    className="min-h-[150px] border-0 focus:ring-0"
                />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !message.trim()}>
                    {isSubmitting ? (
                        <>
                            <LoadingSpinner size={16} className="mr-2" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Reply
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
