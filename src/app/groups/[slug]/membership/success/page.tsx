import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Calendar, CreditCard } from "lucide-react"

export default async function MembershipSuccessPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ session_id: string }>
}) {
    const { slug } = await params
    const { session_id } = await searchParams

    return (
        <div className="container mx-auto px-4 py-24">
            <div className="max-w-xl mx-auto text-center">
                <div className="mb-8 flex justify-center">
                    <div className="rounded-full bg-green-100 p-4">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold mb-4">Registration Received!</h1>
                <p className="text-xl text-muted-foreground mb-12">
                    Thank you for registering. Your membership registration is now being processed.
                </p>

                <div className="grid gap-6 text-left">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">What happens next?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <Calendar className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <div className="font-bold">Registration Review</div>
                                    <p className="text-sm text-muted-foreground">The group administrators will review your registration and assign sections accordingly.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CreditCard className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <div className="font-bold">Payment Schedule</div>
                                    <p className="text-sm text-muted-foreground">You will receive automated reminders for future installments if you chose a payment plan.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12 flex flex-col gap-4">
                    <Button asChild size="lg">
                        <Link href={`/groups/${slug}`}>
                            Return to Group Page
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            Go to My Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
