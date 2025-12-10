
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { EventFormData } from '@/hooks/use-event-form'

interface LocationSectionProps {
    formData: EventFormData
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function LocationSection({ formData, handleInputChange }: LocationSectionProps) {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Event location"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="google_map_link">Google Maps Link</Label>
                <Input
                    id="google_map_link"
                    type="url"
                    value={formData.google_map_link}
                    onChange={handleInputChange}
                    placeholder="https://maps.google.com/..."
                />
            </div>
        </>
    )
}
