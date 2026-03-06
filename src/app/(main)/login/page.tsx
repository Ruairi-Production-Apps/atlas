"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isUnverified, setIsUnverified] = useState(false)
    const [lastEmailSentAt, setLastEmailSentAt] = useState<number | null>(null)
    const [countdown, setCountdown] = useState(0)
    const [resending, setResending] = useState(false)

    // Check for URL parameters (email verification success/error)
    useEffect(() => {
        const verified = searchParams.get('verified')
        const urlError = searchParams.get('error')

        if (verified === 'true') {
            setSuccess('Email verified successfully! You can now log in.')
        }

        if (urlError) {
            setError(decodeURIComponent(urlError))
        }

        // We don't manually clear the URL here anymore as AuthErrorHandler 
        // in the root layout handles it globally and more robustly.
    }, [searchParams])

    // Countdown timer for resend button
    useEffect(() => {
        if (!lastEmailSentAt) return

        const interval = setInterval(() => {
            const secondsElapsed = Math.floor((Date.now() - lastEmailSentAt) / 1000)
            const remainingSeconds = Math.max(0, 300 - secondsElapsed) // 5 minutes = 300 seconds
            setCountdown(remainingSeconds)
        }, 1000)

        return () => clearInterval(interval)
    }, [lastEmailSentAt])

    const handleResendVerification = async () => {
        if (!email) return

        setResending(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                }
            })

            if (resendError) {
                throw resendError
            }

            setLastEmailSentAt(Date.now())
            setError(null)
        } catch (err: any) {
            setError(err.message || "Failed to resend verification email")
        } finally {
            setResending(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)
        setIsUnverified(false)

        try {
            const supabase = createClient()
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                // Check if error is due to unconfirmed email
                if (signInError.message === "Email not confirmed") {
                    setIsUnverified(true)
                    setLastEmailSentAt(Date.now())
                    setError("You must click the link sent to you by email to confirm your account and log in.")
                } else {
                    throw signInError
                }
                return
            }

            if (data.user) {
                // Redirect based on user role or to home
                router.push("/")
                router.refresh()
            }
        } catch (err: any) {
            console.error("Login client error:", err)
            setError(err.message || "Failed to sign in")
        } finally {
            setLoading(false)
        }
    }

    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        if (mins > 0) {
            return `${mins} min${mins !== 1 ? 's' : ''} ${secs} sec${secs !== 1 ? 's' : ''}`
        }
        return `${secs} second${secs !== 1 ? 's' : ''}`
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                        <CardDescription>
                            Enter your email and password to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {success && (
                                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 shrink-0" />
                                        <span className="text-sm">{success}</span>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email verification notice with resend button */}
                            {isUnverified && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                        <div className="flex-1 space-y-3">
                                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                                Check your inbox for the verification email and click the link to activate your account.
                                            </p>
                                            {countdown > 0 ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                    className="w-full"
                                                >
                                                    You can resend this email in {formatCountdown(countdown)}
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleResendVerification}
                                                    disabled={resending}
                                                    className="w-full"
                                                >
                                                    {resending ? "Sending..." : "Resend Verification Email"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Don't have an account? </span>
                            <Link href="/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
