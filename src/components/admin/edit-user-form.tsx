"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditUserFormProps {
    userId: string
    initialData: {
        email: string
        full_name: string
    }
}

export function EditUserForm({ userId, initialData }: EditUserFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: initialData.email,
        full_name: initialData.full_name,
        password: "",
        confirmPassword: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validate passwords match if password is provided
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        // Validate password length if provided
        if (formData.password && formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            setLoading(false)
            return
        }

        try {
            const payload: any = {
                email: formData.email,
                full_name: formData.full_name || null,
            }

            // Only include password if it's provided
            if (formData.password) {
                payload.password = formData.password
            }

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user')
            }

            router.push('/admin/users')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>
                    Update user information. Leave password fields empty to keep the current password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Enter full name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            minLength={6}
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Leave empty to keep current password"
                        />
                        <p className="text-sm text-muted-foreground">
                            Leave empty to keep the current password. Minimum 6 characters if changing.
                        </p>
                    </div>

                    {formData.password && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                minLength={6}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm new password"
                            />
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update User'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

