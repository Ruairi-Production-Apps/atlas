"use client"

import Flatpickr from "react-flatpickr"
import "flatpickr/dist/flatpickr.min.css"
import { cn } from "@/lib/utils"

interface FlatpickrDateInputProps {
    name?: string
    value?: Date | string | number | Date[] | string[]
    onChange?: (dates: Date[], currentDateString: string, self: any, data?: any) => void
    placeholder?: string
    className?: string
    id?: string
    options?: any
}

export function FlatpickrDateInput({ name, value, onChange, placeholder, className, id, options }: FlatpickrDateInputProps) {
    return (
        <Flatpickr
            name={name}
            id={id}
            value={value}
            onChange={onChange}
            className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            options={{
                dateFormat: 'Y-m-d H:i',
                enableTime: true,
                time_24hr: true,
                allowInput: true,
                altInput: true,
                altFormat: 'd/m/Y H:i', // European format
                locale: {
                    firstDayOfWeek: 1
                },
                ...options
            }}
            placeholder={placeholder}
        />
    )
}
