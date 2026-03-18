'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSiteUrl } from '@/lib/config/app-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { User } from '@supabase/supabase-js'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ProfileFormProps {
    user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [firstName, setFirstName] = useState(user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '')
    const [lastName, setLastName] = useState(user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '')
    const [email, setEmail] = useState(user.email || '')

    // Password change states
    const [changingPassword, setChangingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { toast } = useToast()
    const supabase = createClient()

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const isEmailChanging = email !== user.email
            const { error } = await supabase.auth.updateUser({
                data: { first_name: firstName, last_name: lastName, full_name: null },
                email: isEmailChanging ? email : undefined
            }, {
                emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/account&message=Email confirmation received. Please check your other email if required to complete the change.`
            })

            if (error) throw error

            toast({
                title: isEmailChanging ? 'Confirmation email sent' : 'Profile updated',
                description: isEmailChanging
                    ? `We've sent a link to ${email}. You may also need to confirm from your old email.`
                    : 'Your profile has been updated.',
            })
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error updating profile',
                description: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Passwords do not match',
                description: 'Please ensure both password fields match.'
            })
            return
        }

        if (newPassword.length < 8) {
            toast({
                variant: 'destructive',
                title: 'Password too short',
                description: 'Password must be at least 8 characters long.'
            })
            return
        }

        setChangingPassword(true)

        try {
            // First, verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email!,
                password: currentPassword
            })

            if (signInError) {
                throw new Error('Current password is incorrect')
            }

            // If current password is correct, update to new password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) throw updateError

            toast({
                title: 'Password updated',
                description: 'Your password has been changed successfully.',
            })

            // Clear password fields
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error changing password',
                description: error.message
            })
        } finally {
            setChangingPassword(false)
        }
    }

    const handleResetPassword = async () => {
        setLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
                redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
            })
            if (error) throw error
            toast({
                title: 'Password reset email sent',
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
                            disabled={loading}
                        />
                        {user.new_email && (
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                Pending change to: {user.new_email}. Please check both email addresses.
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Changing email will require confirmation from both old and new addresses.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security
                </h3>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        disabled={changingPassword}
                                        placeholder="Enter current password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={changingPassword}
                                        placeholder="Enter new password (min. 8 characters)"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={changingPassword}
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

                            <div className="flex gap-2 pt-2">
                                <Button
                                    type="submit"
                                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                >
                                    {changingPassword ? 'Changing...' : 'Change Password'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6 pt-6 border-t">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Forgot your password?
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Can't remember your current password? We'll send you a reset link.
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
