'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { User } from '@supabase/supabase-js'

interface ProfileFormProps {
    user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
    const [email, setEmail] = useState(user.email || '')
    const { toast } = useToast()
    const supabase = createClient()

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName },
                email: email !== user.email ? email : undefined
            })

            if (error) throw error

            toast({
                title: 'Profile updated',
                description: email !== user.email
                    ? 'Check your email to confirm the change.'
                    : 'Your profile has been updated.',
            })
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error updated profile',
                description: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async () => {
        setLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) throw error
            toast({
                title: 'Password Reset Email Sent',
                description: 'Check your email for the password reset link.',
            })
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-xl">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Details</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading} // Email update is sensitive
                        />
                        <p className="text-xs text-muted-foreground">
                            Changing email will require confirmation.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Security</h3>
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                        Need to update your password?
                    </span>
                    <Button
                        variant="outline"
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="w-fit"
                    >
                        Send Password Reset Email
                    </Button>
                </div>
            </div>
        </div>
    )
}
