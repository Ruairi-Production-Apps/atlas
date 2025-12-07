"use client"

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { Event } from "@/lib/supabase/queries"
import { useRouter } from "next/navigation"

interface CalendarViewProps {
    events: Event[]
}

export function CalendarView({ events }: CalendarViewProps) {
    const router = useRouter()

    const calendarEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_date,
        end: event.end_date || event.start_date,
        url: `/events/${event.slug}`,
        backgroundColor: getEventColor(event.scope_type),
        borderColor: getEventColor(event.scope_type),
        extendedProps: {
            location: event.location,
            price: event.price
        }
    }))

    const handleEventClick = (info: any) => {
        info.jsEvent.preventDefault();
        if (info.event.url) {
            router.push(info.event.url);
        }
    }

    return (
        <div className="bg-background rounded-lg border shadow-sm p-4">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,listWeek'
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                height="auto"
                aspectRatio={1.5}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                }}
            />
            <style jsx global>{`
                .fc-button-primary {
                    background-color: var(--primary) !important;
                    border-color: var(--primary) !important;
                }
                .fc-button-primary:hover {
                    background-color: var(--primary) !important;
                    border-color: var(--primary) !important;
                    filter: brightness(0.9);
                }
                .fc-button-primary:not(:disabled).fc-button-active, 
                .fc-button-primary:not(:disabled):active {
                    background-color: var(--primary) !important;
                    border-color: var(--primary) !important;
                    filter: brightness(0.8);
                }
            `}</style>
        </div>
    )
}

function getEventColor(scopeType: string): string {
    switch (scopeType) {
        case 'province':
            return '#10b981' // emerald-500
        case 'county':
            return '#3b82f6' // blue-500
        case 'group':
            return '#f59e0b' // amber-500
        case 'section':
            return '#8b5cf6' // violet-500
        default:
            return '#64748b' // slate-500
    }
}
