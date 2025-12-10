"use client"

import { EventForm } from "@/components/admin/event-form"
import { useRouter } from "next/navigation"

interface AdminEditEventClientProps {
    event: any // Using any for simplicity as Event type matches form interface
}

export function AdminEditEventClient({ event }: AdminEditEventClientProps) {
    const router = useRouter()

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Edit Event: {event.title}</h1>
            <div className="bg-card border rounded-lg p-6">
                <EventForm
                    organizationId={event.scope_id}
                    organizationType={event.scope_type}
                    event={event}
                    onSuccess={() => router.push('/admin/events')}
                    onCancel={() => router.push('/admin/events')}
                />
            </div>
        </div>
    )
}
