'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import type { JSONContent } from '@tiptap/react'
import { submitTicket } from '@/app/tickets/actions'

export function CreateTicketForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [description, setDescription] = useState('')
    const { toast } = useToast()
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        formData.append('description', description)

        try {
            const result = await submitTicket(formData)
            if (result && result.id) {
                toast({
                    title: "Ticket created",
                    description: "Your support ticket has been submitted successfully.",
                })
                router.push(`/tickets/${result.id}`)
            }
        } catch (error) {
            console.error(error)
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to create ticket. Please try again.",
            })
            setIsSubmitting(false)
        }
    }

    return (
        <form action={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Ticket Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="type" className="text-sm font-medium">Ticket Type</label>
                        <select
                            name="type"
                            id="type"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="question">Question</option>
                            <option value="feature_request">Feature Request</option>
                            <option value="bug_report">Bug Report</option>
                            <option value="add_edit_organisation">Add/Edit Organisation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                        <Input
                            name="subject"
                            id="subject"
                            placeholder="Brief summary of your issue"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <RichTextEditor
                            content={description}
                            onChange={(html) => setDescription(html)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="files" className="text-sm font-medium">Attachments</label>
                        <Input
                            id="files"
                            name="files"
                            type="file"
                            multiple
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                            You can upload multiple files (images, PDFs, documents)
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size={16} className="mr-2" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Ticket'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
