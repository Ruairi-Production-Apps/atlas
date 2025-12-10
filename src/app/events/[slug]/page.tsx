import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getEventBySlug } from "@/lib/supabase/queries"
import { Calendar, MapPin, Tag, Users, Euro } from "lucide-react"
import Link from "next/link"
import { createClient } from '@/lib/supabase/server'
import { FormRenderer } from '@/components/events/form-renderer'
import { format } from 'date-fns'
import { EditLink } from '@/components/ui/edit-link'
import { ImageModal } from '@/components/events/image-modal'

export default async function EventPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const event = await getEventBySlug(slug)

    if (!event) {
        notFound()
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let canEdit = false
    let editUrl = ''

    if (user) {
        // Check permissions
        const { checkOrganizationPermission } = await import('@/lib/auth-utils')

        // Handle sitewide (national) events
        if ((event.scope_type as string) === 'sitewide') {
            const { data: sysadminRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'sysadmin')
                .maybeSingle()

            if (sysadminRole) {
                canEdit = true
                editUrl = `/admin/events/${event.id}/edit`
            }
        } else {
            // Handle organization events
            canEdit = await checkOrganizationPermission(
                supabase,
                user.id,
                event.scope_type,
                event.scope_id,
                'can_manage_events'
            )

            if (canEdit) {
                // If sysadmin, use admin route, otherwise use dashboard route
                const { data: sysadminRole } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .eq('role', 'sysadmin')
                    .maybeSingle()

                if (sysadminRole) {
                    editUrl = `/admin/events/${event.id}/edit`
                } else {
                    editUrl = `/dashboard/${event.scope_type}/${event.scope_id}/events/${event.id}/edit`
                }
            }
        }
    }

    // Fetch associated form (if any)
    const { data: form } = await supabase
        .from('event_forms')
        .select('*, form_fields(*)')
        .eq('event_id', event.id)
        .eq('enabled', true)
        .single()

    // Process fields if form exists (sort them)
    const fields = form?.form_fields?.sort((a: any, b: any) => a.display_order - b.display_order) || []

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-IE', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatDateTime = (dateString: string) => {
        return `${formatDate(dateString)} at ${formatTime(dateString)}`
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 space-y-4">
                    {event.featured_image_url && (
                        <ImageModal
                            src={event.featured_image_url}
                            alt={event.title}
                        />
                    )}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-4xl font-bold">{event.title}</h1>
                        {canEdit && (
                            <EditLink href={editUrl} />
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <span>{format(new Date(event.start_date), 'PPP')}</span>
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                <span>{event.location}</span>
                            </div>
                        )}
                    </div>

                    <div
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: event.body || '' }}
                    />
                </div>

                {/* Render the form button if it exists */}
                {form && (
                    <div className="mt-12 border-t pt-8">
                        <div className="flex justify-start">
                            <Link href={`/events/${slug}/forms/${form.id}`}>
                                <Button size="lg">{form.button_text || 'Register Now'}</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

