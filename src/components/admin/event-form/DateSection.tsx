
import React from 'react'
import { Label } from '@/components/ui/label'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { EventFormData } from '@/hooks/use-event-form'
import { Switch } from '@/components/ui/switch'

interface DateSectionProps {
    formData: EventFormData
    setFieldValue: (field: keyof EventFormData, value: any) => void
}

export function DateSection({ formData, setFieldValue }: DateSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full flex items-center space-x-2">
                <Switch
                    id="include_time"
                    checked={!formData.is_all_day}
                    onCheckedChange={(checked) => setFieldValue('is_all_day', !checked)}
                />
                <Label htmlFor="include_time">Include Time</Label>
            </div>

            <div className="flex flex-col space-y-2">
                <Label htmlFor="start_date">Start Date {formData.is_all_day ? '' : '& Time'} *</Label>
                <Flatpickr
                    value={formData.start_date ? new Date(formData.start_date) : []}
                    onChange={(dates) => {
                        if (dates && dates.length > 0) {
                            if (formData.is_all_day) {
                                const date = dates[0]
                                date.setHours(0, 0, 0, 0)
                                setFieldValue('start_date', date.toISOString())
                            } else {
                                // Ensure we keep the local time as selected by user
                                // Flatpickr puts the selected time into the date object
                                setFieldValue('start_date', dates[0].toISOString())
                            }
                        } else {
                            setFieldValue('start_date', '')
                        }
                    }}
                    options={{
                        enableTime: !formData.is_all_day,
                        dateFormat: formData.is_all_day ? 'Y-m-d' : 'Y-m-d H:i',
                        time_24hr: true,
                        allowInput: true,
                        static: true,
                        clickOpens: true,
                        locale: {
                            firstDayOfWeek: 1,
                        },
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={formData.is_all_day ? "Select start date" : "Select start date and time"}
                />
            </div>
            <div className="flex flex-col space-y-2">
                <Label htmlFor="end_date">End Date {formData.is_all_day ? '' : '& Time'}</Label>
                <Flatpickr
                    value={formData.end_date ? new Date(formData.end_date) : []}
                    onChange={(dates) => {
                        if (dates && dates.length > 0) {
                            if (formData.is_all_day) {
                                const date = dates[0]
                                date.setHours(23, 59, 59, 999)
                                setFieldValue('end_date', date.toISOString())
                            } else {
                                setFieldValue('end_date', dates[0].toISOString())
                            }
                        } else {
                            setFieldValue('end_date', '')
                        }
                    }}
                    options={{
                        enableTime: !formData.is_all_day,
                        dateFormat: formData.is_all_day ? 'Y-m-d' : 'Y-m-d H:i',
                        time_24hr: true,
                        allowInput: true,
                        static: true,
                        clickOpens: true,
                        locale: {
                            firstDayOfWeek: 1,
                        },
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={formData.is_all_day ? "Select end date (optional)" : "Select end date and time (optional)"}
                />
            </div>
        </div>
    )
}
