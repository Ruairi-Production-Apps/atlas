
import React from 'react'
import { Label } from '@/components/ui/label'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { EventFormData } from '@/hooks/use-event-form'

interface DateSectionProps {
    formData: EventFormData
    setFieldValue: (field: keyof EventFormData, value: any) => void
}

export function DateSection({ formData, setFieldValue }: DateSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
                <Label htmlFor="start_date">Start Date & Time *</Label>
                <Flatpickr
                    value={formData.start_date ? new Date(formData.start_date) : undefined}
                    onChange={(dates) => {
                        if (dates && dates.length > 0) {
                            setFieldValue('start_date', dates[0].toISOString())
                        } else {
                            setFieldValue('start_date', '')
                        }
                    }}
                    options={{
                        enableTime: true,
                        dateFormat: 'Y-m-d H:i',
                        time_24hr: true,
                        allowInput: true,
                        static: true,
                        clickOpens: true,
                        locale: {
                            firstDayOfWeek: 1,
                        },
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Select start date and time"
                />
            </div>
            <div className="flex flex-col space-y-2">
                <Label htmlFor="end_date">End Date & Time</Label>
                <Flatpickr
                    value={formData.end_date ? new Date(formData.end_date) : undefined}
                    onChange={(dates) => {
                        if (dates && dates.length > 0) {
                            setFieldValue('end_date', dates[0].toISOString())
                        } else {
                            setFieldValue('end_date', '')
                        }
                    }}
                    options={{
                        enableTime: true,
                        dateFormat: 'Y-m-d H:i',
                        time_24hr: true,
                        allowInput: true,
                        static: true,
                        clickOpens: true,
                        locale: {
                            firstDayOfWeek: 1,
                        },
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Select end date and time (optional)"
                />
            </div>
        </div>
    )
}
