"use client"

import { Button } from "@/components/ui/button"
import { CalendarCheck, Calendar } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AddToCalendarProps {
    event: {
        title: string
        description: string | null
        location: string | null
        start_date: string
        end_date: string | null
    }
}

export function AddToCalendar({ event }: AddToCalendarProps) {
    const googleCalendarUrl = () => {
        const start = new Date(event.start_date).toISOString().replace(/-|:|\.\d\d\d/g, "")
        const end = event.end_date
            ? new Date(event.end_date).toISOString().replace(/-|:|\.\d\d\d/g, "")
            : new Date(new Date(event.start_date).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "")

        const url = new URL("https://calendar.google.com/calendar/render")
        url.searchParams.append("action", "TEMPLATE")
        url.searchParams.append("text", event.title)
        if (event.description) url.searchParams.append("details", event.description)
        if (event.location) url.searchParams.append("location", event.location)
        url.searchParams.append("dates", `${start}/${end}`)

        return url.toString()
    }

    const outlookCalendarUrl = () => {
        const start = new Date(event.start_date).toISOString()
        const end = event.end_date
            ? new Date(event.end_date).toISOString()
            : new Date(new Date(event.start_date).getTime() + 60 * 60 * 1000).toISOString()

        const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose")
        url.searchParams.append("subject", event.title)
        if (event.description) url.searchParams.append("body", event.description)
        if (event.location) url.searchParams.append("location", event.location)
        url.searchParams.append("startdt", start)
        url.searchParams.append("enddt", end)
        url.searchParams.append("path", "/calendar/action/compose")
        url.searchParams.append("rru", "addevent")

        return url.toString()
    }

    const downloadIcs = () => {
        const start = new Date(event.start_date).toISOString().replace(/-|:|\.\d\d\d/g, "")
        const end = event.end_date
            ? new Date(event.end_date).toISOString().replace(/-|:|\.\d\d\d/g, "")
            : new Date(new Date(event.start_date).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "")

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "BEGIN:VEVENT",
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${event.title}`,
            event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : "",
            event.location ? `LOCATION:${event.location}` : "",
            "END:VEVENT",
            "END:VCALENDAR"
        ].filter(line => line).join("\r\n")

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `${event.title}.ics`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <CalendarCheck className="h-4 w-4" />
                    Add to Calendar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        Google Calendar
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={outlookCalendarUrl()} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        Outlook.com
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadIcs} className="cursor-pointer">
                    Apple / Outlook (Desktop)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
