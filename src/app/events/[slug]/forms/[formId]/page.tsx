import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getEventBySlug } from "@/lib/supabase/queries"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from '@/lib/supabase/server'
import { FormRenderer } from '@/components/events/form-renderer'

export default async function PublicFormPage({
    params,
}: {
    params: Promise<{ slug: string; formId: string }>
}) {
    const { slug, formId } = await params
    const event = await getEventBySlug(slug)

    if (!event) {
        notFound()
    }

    const supabase = await createClient()

    // Fetch the form
    const { data: form } = await supabase
        .from('event_forms')
        .select('*, form_fields(*)')
        .eq('id', formId)
        .eq('event_id', event.id)
        .eq('enabled', true)
        .single()

    if (!form) {
        notFound()
    }

    // Fetch groups for the group field
    const { data: groups } = await supabase
        .from('groups')
        .select('id, name')
        .order('name')

    // Process fields (sort them)
    const fields = form.form_fields?.sort((a: any, b: any) => a.display_order - b.display_order) || []

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link href={`/events/${slug}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {event.title}
            </Link>

            <FormRenderer
                formId={form.id}
                eventId={event.id}
                title={form.title}
                description={form.description}
                fields={fields}
                groups={groups || []}
            />
        </div>
    )
}
