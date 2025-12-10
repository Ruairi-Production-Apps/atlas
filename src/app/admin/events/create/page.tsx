"use client"

import { EventForm } from "@/components/admin/event-form"
import { useRouter } from "next/navigation"

export default function AdminCreateEventPage() {
    const router = useRouter()

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Create National Event</h1>
            <div className="bg-card border rounded-lg p-6">
                <EventForm
                    organizationId="00000000-0000-0000-0000-000000000000"
                    organizationType="sitewide"
                    onSuccess={() => router.push('/admin/events')}
                    onCancel={() => router.push('/admin/events')}
                />
            </div>
        </div>
    )
}
