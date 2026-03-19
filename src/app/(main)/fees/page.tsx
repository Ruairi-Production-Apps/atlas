"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle } from "lucide-react"

export default function FeesPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState("")

    const handleSendPaymentLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch('/api/membership/pay/resend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({ email }),
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.error || "Something went wrong. Please try again.")
            } else {
                setSent(true)
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-24 max-w-3xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Group Fees</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    You can pay your group membership fees right here on this website.
                    Enter your email address below and we&apos;ll send you a payment link.
                </p>
            </div>

            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Get your payment link
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {sent ? (
                        <div className="flex flex-col items-center gap-4 py-4 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <div>
                                <p className="font-medium text-lg">Check your email</p>
                                <p className="text-muted-foreground mt-1">
                                    If we found a pending payment for <strong>{email}</strong>, a payment link has been sent.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => { setSent(false); setEmail("") }}
                                className="mt-2"
                            >
                                Use a different email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendPaymentLink} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Enter the email you registered with and we&apos;ll send you a payment link.
                                </p>
                            </div>
                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={loading || !email}>
                                {loading ? "Sending..." : "Send Payment Link"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
