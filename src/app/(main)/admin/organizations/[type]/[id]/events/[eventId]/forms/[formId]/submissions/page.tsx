import { FormSubmissionsList } from "@/components/admin/form-submissions-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
    params: Promise<{
        type: string
        id: string
        eventId: string
        formId: string
    }>
}

export default async function AdminSubmissionsPage({ params }: PageProps) {
    const resolvedParams = await params
    const { type, id, eventId, formId } = resolvedParams

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4 pl-0">
                        <Link href={`/admin/organizations/${type}/${id}/events/${eventId}/forms`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Forms
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Form Submissions</h1>
                    <p className="text-muted-foreground">
                        View and manage submissions for this form.
                    </p>
                </div>
            </div>

            <FormSubmissionsList
                formId={formId}
                eventId={eventId}
                organizationId={id}
                organizationType={type}
            />
        </div>
    )
}
