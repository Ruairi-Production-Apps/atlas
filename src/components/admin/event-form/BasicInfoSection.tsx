
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { EventFeaturedImageUpload } from '../event-featured-image-upload'
import { EventFormData } from '@/hooks/use-event-form'

interface BasicInfoSectionProps {
    formData: EventFormData
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    setFieldValue: (field: keyof EventFormData, value: any) => void
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team' | 'sitewide'
    eventId?: string | null
}

export function BasicInfoSection({
    formData,
    handleInputChange,
    setFieldValue,
    organizationId,
    organizationType,
    eventId
}: BasicInfoSectionProps) {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                />
            </div>

            <EventFeaturedImageUpload
                organizationId={organizationId}
                organizationType={organizationType}
                eventId={eventId || null}
                currentImageUrl={formData.featured_image_url}
                onImageUpdate={(imageUrl) => setFieldValue('featured_image_url', imageUrl || '')}
            />
        </>
    )
}
