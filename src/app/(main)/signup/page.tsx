"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getSiteUrl } from "@/lib/config/app-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Mail, CheckCircle2 } from "lucide-react"
import { cn, getOptimizedImageUrl } from "@/lib/utils"
import { GroupDropdown } from "@/components/auth/group-dropdown"

interface Group {
    id: string
    name: string
    slug: string
    logo_url: string | null
    county_name?: string
    province_name?: string
}

interface InvitationData {
    organizationId: string
    organizationType: string
    organizationName: string
    role: string
    sectionIds?: string[]
    isSectionLead?: boolean
}

export default function SignupPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const inviteToken = searchParams.get('invite')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        group_id: ""
    })

    // Invitation state
    const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
    const [invitationLoading, setInvitationLoading] = useState(false)
    const [invitationError, setInvitationError] = useState<string | null>(null)

    const [allGroups, setAllGroups] = useState<Group[]>([])
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
    const [groupSearchQuery, setGroupSearchQuery] = useState("")
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false)

    // Validate invitation token if present
    useEffect(() => {
        if (inviteToken) {
            validateInvitation(inviteToken)
        }
    }, [inviteToken])

    const validateInvitation = async (token: string) => {
        setInvitationLoading(true)
        setInvitationError(null)

        try {
            const response = await fetch(`/api/invitations/validate/${token}`)
            const data = await response.json()

            if (!response.ok || !data.valid) {
                setInvitationError(data.error || 'Invalid invitation link')
                return
            }

            setInvitationData(data.invitation)

            // Pre-fill organization if it's a group
            if (data.invitation.organizationType === 'group') {
                setFormData(prev => ({
                    ...prev,
                    group_id: data.invitation.organizationId
                }))
            }
        } catch (error) {
            console.error('Invitation validation error:', error)
            setInvitationError('Failed to validate invitation')
        } finally {
            setInvitationLoading(false)
        }
    }

    // Load all groups on mount
    useEffect(() => {
        const fetchGroups = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('groups')
                .select(`
                    id, 
                    name, 
                    slug, 
                    logo_url,
                    county:counties(name, province:provinces(name))
                `)
                .order('name')

            if (data) {
                const groupsWithLocation = data.map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    slug: g.slug,
                    logo_url: g.logo_url,
                    county_name: g.county?.name || '',
                    province_name: g.county?.province?.name || ''
                }))
                setAllGroups(groupsWithLocation)
                setFilteredGroups(groupsWithLocation)
            }
        }
        fetchGroups()
    }, [])

    // Filter groups based on search
    useEffect(() => {
        if (!groupSearchQuery.trim()) {
            setFilteredGroups(allGroups)
            return
        }

        const query = groupSearchQuery.toLowerCase()
        const filtered = allGroups.filter(g =>
            g.name.toLowerCase().includes(query) ||
            g.county_name?.toLowerCase().includes(query) ||
            g.province_name?.toLowerCase().includes(query)
        )
        setFilteredGroups(filtered)
    }, [groupSearchQuery, allGroups])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
        if (!passwordRegex.test(formData.password)) {
            setError("Password must be at least 8 characters and include at least one uppercase letter, one number, and one symbol")
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()

            // Check if email already exists in profiles
            // Note: This relies on 'anon' having SELECT permission on 'profiles' table,
            // which was enabled for public profile functionality.
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', formData.email)
                .single()

            if (existingProfile) {
                setError("This email address is already in use")
                setLoading(false)
                return
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
                        // Track requested membership in metadata
                        requested_group_id: formData.group_id === 'not_listed' ? null : formData.group_id || null,
                        group_not_listed: formData.group_id === 'not_listed',
                        // Include invitation data if present
                        invitation_organization_id: invitationData?.organizationId || null,
                        invitation_organization_type: invitationData?.organizationType || null,
                        invitation_role: invitationData?.role || null,
                        invitation_section_ids: invitationData?.sectionIds || null,
                        invitation_is_section_lead: invitationData?.isSectionLead || false,
                        invitation_token: inviteToken || null,
                    },
                    emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/login?verified=true`,
                },
            })

            if (signUpError) {
                throw signUpError
            }

            if (data.user) {
                // If there's an invitation token, mark it as used
                if (inviteToken) {
                    try {
                        await fetch(`/api/invitations/mark-used/${inviteToken}`, {
                            method: 'POST'
                        })
                    } catch (err) {
                        console.error('Failed to mark invitation as used:', err)
                        // Don't fail signup if this fails
                    }
                }

                setSuccess(true)
            }
        } catch (err: any) {
            setError(err.message || "Failed to create account")
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
                            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                            <CardDescription>
                                We've sent you a confirmation link to verify your email address.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Please check your email and click the confirmation link to complete your registration.
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/login">Go to Login</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const selectedGroup = allGroups.find(g => g.id === formData.group_id)

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
                {/* Invitation Banner */}
                {invitationData && !invitationError && (
                    <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-primary mb-1">
                                    You've been invited!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    You're signing up as a <span className="font-medium">{invitationData.role === 'parent' ? 'Parent' : 'Scouter'}</span> for{' '}
                                    <span className="font-medium">{invitationData.organizationName}</span>
                                </p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                )}

                {/* Invitation Error */}
                {invitationError && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-destructive mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-destructive mb-1">
                                    Invalid Invitation
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {invitationError}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                        <CardDescription>
                            Enter your information to create a new account on Atlas.
                            Atlas accounts are only for Scouters and Parents only, and not for Youth Members.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        placeholder="John"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        placeholder="Doe"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Group Selection with Search */}
                            <div className="space-y-2">
                                <Label htmlFor="group">Group (Optional)</Label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                                        className={cn(
                                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            !formData.group_id && "text-muted-foreground"
                                        )}
                                        disabled={loading}
                                    >
                                        {formData.group_id === 'not_listed' ? (
                                            <span>Not Listed</span>
                                        ) : selectedGroup ? (
                                            <div className="flex items-center gap-2">
                                                {selectedGroup.logo_url ? (
                                                    <img
                                                        src={getOptimizedImageUrl(selectedGroup.logo_url, 80)}
                                                        alt=""
                                                        className="h-5 w-5 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="truncate">{selectedGroup.name}</span>
                                            </div>
                                        ) : (
                                            <span>Select a group or choose Not Listed</span>
                                        )}
                                        <Search className="h-4 w-4 opacity-50 ml-2 shrink-0" />
                                    </button>

                                    {isGroupDropdownOpen && (
                                        <GroupDropdown
                                            groups={filteredGroups}
                                            searchQuery={groupSearchQuery}
                                            onSearchChange={setGroupSearchQuery}
                                            onSelect={(groupId) => {
                                                setFormData(prev => ({ ...prev, group_id: groupId }))
                                                setIsGroupDropdownOpen(false)
                                                setGroupSearchQuery("")
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters, with 1 uppercase, 1 number, and 1 symbol
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <Link href="/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}
