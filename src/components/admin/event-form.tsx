'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useEventForm, Event } from '@/hooks/use-event-form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BasicInfoSection } from './event-form/BasicInfoSection'
import { DateSection } from './event-form/DateSection'
import { LocationSection } from './event-form/LocationSection'
import { DescriptionSection } from './event-form/DescriptionSection'
import { VisibilitySection } from './event-form/VisibilitySection'
import { PaymentSection } from './event-form/PaymentSection'
import { CapacitySection } from './event-form/CapacitySection'
import { TagsSection } from './event-form/TagsSection'

interface EventFormProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team' | 'sitewide'
    event?: Event | null
    onSuccess: () => void
    onCancel: () => void
}

export function EventForm({
    organizationId,
    organizationType,
    event,
    onSuccess,
    onCancel,
}: EventFormProps) {
    const {
        formData,
        setFormData,
        setFieldValue,
        selectedSections,
        setSelectedSections,
        financialData,
        loading,
        error,
        handleInputChange,
        handleCheckboxChange,
        handleRichTextChange,
        handleSubmit
    } = useEventForm({
        organizationId,
        organizationType,
        event,
        onSuccess
    })

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            <BasicInfoSection
                formData={formData}
                handleInputChange={handleInputChange}
                setFieldValue={setFieldValue}
                organizationId={organizationId}
                organizationType={organizationType}
                eventId={event?.id || null}
            />

            <DateSection
                formData={formData}
                setFieldValue={setFieldValue}
            />

            <LocationSection
                formData={formData}
                handleInputChange={handleInputChange}
                setFieldValue={setFieldValue}
            />

            <DescriptionSection
                formData={formData}
                handleRichTextChange={handleRichTextChange}
            />

            <VisibilitySection
                formData={formData}
                handleInputChange={handleInputChange}
                selectedSections={selectedSections}
                setSelectedSections={setSelectedSections}
            />

            <PaymentSection
                formData={formData}
                financialData={financialData}
                handleCheckboxChange={handleCheckboxChange}
                handleInputChange={handleInputChange}
                setFormData={setFormData}
            />

            <CapacitySection
                formData={formData}
                handleInputChange={handleInputChange}
            />

            <TagsSection
                formData={formData}
                setFieldValue={setFieldValue}
            />

            {!event && (
                <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold">Publishing Status</Label>
                    <RadioGroup
                        defaultValue={formData.published ? "published" : "draft"}
                        onValueChange={(value) => setFieldValue('published', value === "published")}
                        className="flex flex-col space-y-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="published" id="status-published" />
                            <Label htmlFor="status-published" className="font-normal cursor-pointer">
                                Publish Immediately
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="draft" id="status-draft" />
                            <Label htmlFor="status-draft" className="font-normal cursor-pointer">
                                Save as Draft
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            )}

            <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {event ? 'Update Event' : 'Create Event'}
                </Button>
            </div>
        </form>
    )
}

