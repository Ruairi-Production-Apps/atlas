
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { EventFeaturedImageUpload } from '../event-featured-image-upload'
import { EventFormData } from '@/hooks/use-event-form'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

            <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                    value={formData.category}
                    onValueChange={(value) => setFieldValue('category', value)}
                >
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="youth_programme">Youth Programme</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                    </SelectContent>
                </Select>
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
