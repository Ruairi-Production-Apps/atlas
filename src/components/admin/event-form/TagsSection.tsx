
import React from 'react'
import { Label } from '@/components/ui/label'
import { TagInput } from '@/components/ui/tag-input'
import { EventFormData } from '@/hooks/use-event-form'

interface TagsSectionProps {
    formData: EventFormData
    setFieldValue: (field: keyof EventFormData, value: any) => void
}

export function TagsSection({ formData, setFieldValue }: TagsSectionProps) {
    return (
        <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
                selectedTags={formData.tags}
                onTagsChange={(tags) => setFieldValue('tags', tags)}
                placeholder="Add tags..."
            />
        </div>
    )
}
