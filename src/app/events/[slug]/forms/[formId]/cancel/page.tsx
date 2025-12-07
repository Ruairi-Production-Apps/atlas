import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default async function PaymentCancelPage({
    params,
}: {
    params: Promise<{ slug: string; formId: string }>
}) {
    const { slug, formId } = await params

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <Card>
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <XCircle className="h-16 w-16 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl text-amber-600">Payment Cancelled</CardTitle>
                    <CardDescription>
                        Your payment was cancelled. No charges have been made.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                        <p className="text-sm text-amber-800">
                            Your registration was not completed because the payment was cancelled.
                            You can try again if you'd like to complete your registration.
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Link href={`/events/${slug}/forms/${formId}`}>
                            <Button>Try Again</Button>
                        </Link>
                        <Link href={`/events/${slug}`}>
                            <Button variant="outline">Back to Event</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
