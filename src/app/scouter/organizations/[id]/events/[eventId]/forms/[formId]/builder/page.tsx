import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FormBuilder } from "@/components/admin/form-builder"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ScouterFormBuilderPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string; eventId: string; formId: string }>
    searchParams: Promise<{ type?: string }>
}) {
    const { id, eventId, formId } = await params
    const { type } = await searchParams
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    if (!type) {
        redirect('/scouter/dashboard')
    }

    // Check permissions
    const { checkOrganizationPermission } = await import('@/lib/auth-utils')
    const hasPermission = await checkOrganizationPermission(supabase, user.id, type, id, 'can_manage_events')

    if (!hasPermission) {
        redirect('/scouter/dashboard')
    }

    // Verify form exists and belongs to event
    const { data: form } = await supabase
        .from('event_forms')
        .select('*')
        .eq('id', formId)
        .eq('event_id', eventId)
        .single()

    if (!form) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Form Builder</h1>
                    <p className="text-muted-foreground">Form: {form.title}</p>
                </div>
                <Link href={`/scouter/organizations/${id}/events/${eventId}/forms?type=${type}`}>
                    <Button variant="outline">
                        Back to Forms
                    </Button>
                </Link>
            </div>
            <FormBuilder
                formId={formId}
                formTitle={form.title}
                eventId={eventId}
                organizationType={type}
                organizationId={id}
                formButtonText={form.button_text || 'Register Now'}
            />
        </div>
    )
}
