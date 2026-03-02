import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ScouterProductFormSubmissionsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string; productId: string; formId: string }>
    searchParams: Promise<{ type?: string }>
}) {
    const { id, productId, formId } = await params
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
    const hasPermission = await checkOrganizationPermission(supabase, user.id, type, id, 'can_manage_store')

    if (!hasPermission) {
        redirect('/scouter/dashboard')
    }

    // Verify form exists
    const { data: form } = await supabase
        .from('product_forms')
        .select('*')
        .eq('id', formId)
        .eq('product_id', productId)
        .single()

    if (!form) {
        notFound()
    }

    // Get submissions
    const { data: submissions } = await supabase
        .from('product_form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Form Submissions</h1>
                    <p className="text-muted-foreground">Form: {form.title}</p>
                </div>
                <Link href={`/scouter/organizations/${id}/products?type=${type}`}>
                    <Button variant="outline">
                        Back to Products
                    </Button>
                </Link>
            </div>

            <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Submissions ({submissions?.length || 0})</h2>
                {!submissions || submissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No submissions yet.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {submissions.map((submission: any) => (
                            <div key={submission.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium">
                                            {new Date(submission.created_at).toLocaleDateString()}
                                        </p>
                                        {submission.selected_date && (
                                            <p className="text-sm text-muted-foreground">
                                                Selected Date: {new Date(submission.selected_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {submission.participant_count_youth > 0 && (
                                            <p className="text-sm">Youth: {submission.participant_count_youth}</p>
                                        )}
                                        {submission.participant_count_scouters > 0 && (
                                            <p className="text-sm">Scouters: {submission.participant_count_scouters}</p>
                                        )}
                                        {submission.total_amount && (
                                            <p className="font-semibold mt-1">€{submission.total_amount}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className={`inline-block px-2 py-1 rounded text-xs ${submission.payment_status === 'paid'
                                            ? 'bg-green-100 text-green-800'
                                            : submission.payment_status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {submission.payment_status || 'none'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
