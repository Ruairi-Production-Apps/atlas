"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MapPin } from "lucide-react"
import { cn, getOptimizedImageUrl } from "@/lib/utils"

interface Group {
    id: string
    name: string
    slug: string
    logo_url: string | null
    county_name?: string
    province_name?: string
}

export default function SignupPage() {
    const router = useRouter()
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

    const [allGroups, setAllGroups] = useState<Group[]>([])
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
    const [groupSearchQuery, setGroupSearchQuery] = useState("")
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false)

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
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                },
            })

            if (signUpError) {
                throw signUpError
            }

            if (data.user) {
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
                                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-hidden flex flex-col">
                                            <div className="p-2 border-b sticky top-0 bg-popover">
                                                <div className="flex items-center border rounded-md px-2">
                                                    <Search className="h-4 w-4 text-muted-foreground mr-2" />
                                                    <Input
                                                        type="text"
                                                        placeholder="Search groups..."
                                                        value={groupSearchQuery}
                                                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                                                        className="border-0 shadow-none focus-visible:ring-0 h-8 px-0"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            <div className="overflow-y-auto">
                                                {/* Not Listed Option */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, group_id: 'not_listed' }))
                                                        setIsGroupDropdownOpen(false)
                                                        setGroupSearchQuery("")
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center px-3 py-2 hover:bg-accent transition-colors text-left border-b",
                                                        formData.group_id === 'not_listed' && "bg-accent"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted mr-3 shrink-0">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium">Not Listed</div>
                                                        <div className="text-xs text-muted-foreground">My group is not in the list</div>
                                                    </div>
                                                </button>

                                                {/* Group Options */}
                                                {filteredGroups.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        No groups found
                                                    </div>
                                                ) : (
                                                    filteredGroups.map((group) => (
                                                        <button
                                                            key={group.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, group_id: group.id }))
                                                                setIsGroupDropdownOpen(false)
                                                                setGroupSearchQuery("")
                                                            }}
                                                            className={cn(
                                                                "w-full flex items-center px-3 py-2 hover:bg-accent transition-colors text-left",
                                                                formData.group_id === group.id && "bg-accent"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mr-3 overflow-hidden shrink-0">
                                                                {group.logo_url ? (
                                                                    <img
                                                                        src={getOptimizedImageUrl(group.logo_url, 80)}
                                                                        alt=""
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <MapPin className="h-4 w-4 text-primary" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium truncate">{group.name}</div>
                                                                <div className="text-xs text-muted-foreground truncate">
                                                                    {[group.county_name, group.province_name].filter(Boolean).join(', ')}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
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
