
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { EventFormData } from '@/hooks/use-event-form'

interface LocationSectionProps {
    formData: EventFormData
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    setFieldValue: (field: keyof EventFormData, value: any) => void
}

export function LocationSection({ formData, handleInputChange, setFieldValue }: LocationSectionProps) {
    return (
        <>
            {/* Location Type */}
            <div className="space-y-2">
                <Label htmlFor="location_type">Location Type *</Label>
                <select
                    id="location_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.location_type}
                    onChange={(e) => setFieldValue('location_type', e.target.value as 'in_person' | 'online')}
                >
                    <option value="in_person">In Person</option>
                    <option value="online">Online</option>
                </select>
            </div>

            {/* Location Name */}
            <div className="space-y-2">
                <Label htmlFor="location">Location Name</Label>
                <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder={formData.location_type === 'online' ? "e.g., Zoom, Google Meet" : "Event location name"}
                />
            </div>

            {/* In Person: Google Maps Link */}
            {formData.location_type === 'in_person' && (
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
            )}

            {/* Online: Meeting Link */}
            {formData.location_type === 'online' && (
                <div className="space-y-2">
                    <Label htmlFor="online_meeting_link">Online Meeting Link</Label>
                    <Input
                        id="online_meeting_link"
                        type="url"
                        value={formData.online_meeting_link}
                        onChange={handleInputChange}
                        placeholder="https://zoom.us/j/..."
                    />
                </div>
            )}
        </>
    )
}
