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
import { AddToCalendar } from "@/components/events/add-to-calendar"
import { getOptimizedImageUrl } from "@/lib/utils"

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
                            src={getOptimizedImageUrl(event.featured_image_url, 80)}
                            alt={event.title}
                        />
                    )}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-4xl font-bold">{event.title}</h1>
                        {canEdit && (
                            <EditLink href={editUrl} />
                        )}
                    </div>

                    <div className="flex flex-col gap-4 text-muted-foreground">
                        {/* Date Section - separate line */}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <span>
                                {format(new Date(event.start_date), 'EEE PPP')}
                                {event.end_date && ` to ${format(new Date(event.end_date), 'EEE PPP')}`}
                            </span>
                        </div>

                        {/* Location and Add to Calendar - separate line/group */}
                        <div className="flex flex-wrap gap-4 items-center">
                            {event.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    {event.google_map_link ? (
                                        <a href={event.google_map_link} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                                            {event.location}
                                        </a>
                                    ) : (
                                        <span>{event.location}</span>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <AddToCalendar event={{
                                    ...event,
                                    description: event.body
                                }} />
                            </div>
                        </div>

                        {/* Section Badges */}
                        {event.visibility === 'sections_only' && event.selected_section_types && event.selected_section_types.length > 0 && (
                            <div className="flex items-start gap-2">
                                <Users className="h-5 w-5 mt-0.5" />
                                <div className="flex flex-wrap gap-2">
                                    {event.selected_section_types.map((section) => {
                                        const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1)
                                        return (
                                            <div
                                                key={section}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20"
                                            >
                                                <img
                                                    src={`/images/scouting_ireland/${sectionLabel} Logo.png`}
                                                    alt={sectionLabel}
                                                    className="w-5 h-5 object-contain"
                                                />
                                                <span className="text-sm font-semibold">{sectionLabel}</span>
                                            </div>
                                        )
                                    })}
                                </div>
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

