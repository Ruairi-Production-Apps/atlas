import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventFormsManager } from "@/components/admin/event-forms-manager"

export default async function ScouterEventFormsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string; eventId: string }>
    searchParams: Promise<{ type?: string }>
}) {
    const { id, eventId } = await params
    const { type } = await searchParams
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    if (!type) {
        // Fallback or error if type is missing? 
        // We really need the type. 
        redirect('/scouter/dashboard')
    }

    // Check if user is admin of this organization OR has can_manage_events permission
    const { checkOrganizationPermission } = await import('@/lib/auth-utils')
    const hasPermission = await checkOrganizationPermission(supabase, user.id, type, id, 'can_manage_events')

    if (!hasPermission) {
        redirect('/scouter/dashboard')
    }

    // Verify event exists and belongs to this organization
    const { data: event } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId)
        .eq('scope_type', type)
        .eq('scope_id', id)
        .single()

    if (!event) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Manage Forms</h1>
                <p className="text-muted-foreground">Event: {event.title}</p>
            </div>
            <EventFormsManager
                eventId={eventId}
                organizationType={type}
                organizationId={id}
            />
        </div>
    )
}
