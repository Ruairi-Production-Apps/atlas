
import React from 'react'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { EventFormData } from '@/hooks/use-event-form'

interface DescriptionSectionProps {
    formData: EventFormData
    handleRichTextChange: (content: string) => void
}

export function DescriptionSection({ formData, handleRichTextChange }: DescriptionSectionProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="body">Event Description</Label>
            <RichTextEditor
                content={formData.body}
                onChange={handleRichTextChange}
                placeholder="Enter the event description..."
            />
        </div>
    )
}
