"use client"

import { useRef, useEffect, useState } from 'react'
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
    const calendarRef = useRef<any>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)

            if (calendarRef.current) {
                const calendarApi = calendarRef.current.getApi()
                if (mobile) {
                    calendarApi.changeView('listMonth')
                } else {
                    calendarApi.changeView('dayGridMonth')
                }
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

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
        <div className="bg-background rounded-lg border shadow-sm p-2 md:p-4">
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth" // Will be overridden by useEffect on mount if mobile
                headerToolbar={{
                    left: isMobile ? 'prev,next' : 'prev,next today',
                    center: 'title',
                    right: isMobile ? 'dayGridMonth,listMonth' : 'dayGridMonth,timeGridWeek,listWeek'
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                height="auto"
                aspectRatio={isMobile ? 0.8 : 1.5}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                }}
                views={{
                    listMonth: { buttonText: 'List' },
                    dayGridMonth: { buttonText: 'Month' },
                    timeGridWeek: { buttonText: 'Week' },
                    listWeek: { buttonText: 'List' }
                }}
            />
            <style jsx global>{`
                .fc-toolbar {
                    flex-direction: column;
                    gap: 1rem;
                }
                @media (min-width: 768px) {
                    .fc-toolbar {
                        flex-direction: row;
                    }
                }
                .fc-button {
                    text-transform: capitalize;
                    font-weight: 600;
                    font-size: 0.875rem !important;
                    letter-spacing: 0.01em;
                }
                .fc-toolbar-title {
                    font-size: 1.25rem !important;
                    text-transform: uppercase;
                }
                .fc-button-primary {
                    background-color: var(--primary) !important;
                    border-color: var(--primary) !important;
                    color: white !important;
                }
                .fc-button-primary .fc-icon {
                    color: white !important;
                    font-size: 1.25em; 
                    display: flex; /* Changed from inline-block */
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                }
                /* Use flex on buttons to center content (icons/text) */
                .fc-button-primary {
                    display: inline-flex !important;
                    align-items: center;
                    justify-content: center;
                }

                /* Fallback if icons are missing, usually they are text characters in some versions or SVGs */
                .fc-icon-chevron-left:before { content: "‹"; }
                .fc-icon-chevron-right:before { content: "›"; }
                
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
