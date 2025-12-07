import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function PaymentSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string; formId: string }>
    searchParams: Promise<{ session_id?: string }>
}) {
    const { slug } = await params
    const { session_id } = await searchParams

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <Card>
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
                    <CardDescription>
                        Your registration has been confirmed and payment has been processed.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-sm text-green-800">
                            ✓ Your form submission has been received
                            <br />
                            ✓ Payment has been processed successfully
                            <br />
                            ✓ You will receive a confirmation email shortly
                        </p>
                    </div>

                    {session_id && (
                        <div className="text-xs text-muted-foreground">
                            <p>Transaction ID: {session_id}</p>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <Link href={`/events/${slug}`}>
                            <Button>Back to Event</Button>
                        </Link>
                        <Link href="/events">
                            <Button variant="outline">Browse Events</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
