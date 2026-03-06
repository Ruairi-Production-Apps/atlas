"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

function ResetPasswordForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        // Check if we have the necessary tokens
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                router.push('/login')
            }
        })
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        // Validate password strength - minimum 8 characters
        if (password.length < 8) {
            setError("Password must be at least 8 characters long")
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            })

            if (updateError) {
                throw updateError
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/account')
            }, 2000)
        } catch (err: any) {
            setError(err.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
                            <CardDescription>
                                Your password has been successfully updated.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Redirecting to your account...
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/account">Go to Account</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
                        <CardDescription>
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        placeholder="Enter new password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters long
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        placeholder="Confirm new password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Loading...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
