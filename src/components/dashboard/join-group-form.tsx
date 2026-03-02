"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, UserPlus } from "lucide-react"
import { cn, getOptimizedImageUrl } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Group {
    id: string
    name: string
    slug: string
    logo_url: string | null
    county_name?: string
    province_name?: string
}

interface JoinGroupFormProps {
    initialOrganizations?: any[]
    initialPendingRequests?: any[]
}

export function JoinGroupForm({ initialOrganizations = [], initialPendingRequests = [] }: JoinGroupFormProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [allGroups, setAllGroups] = useState<Group[]>([])
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
    const [groupSearchQuery, setGroupSearchQuery] = useState("")
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false)

    const [selectedGroupId, setSelectedGroupId] = useState("")
    const [roleType, setRoleType] = useState("")
    const [message, setMessage] = useState("")

    const [memberGroupIds, setMemberGroupIds] = useState<string[]>(
        initialOrganizations.map(o => o.scope_id || o.id)
    )
    const [pendingGroupIds, setPendingGroupIds] = useState<string[]>(
        initialPendingRequests.map(r => r.group?.id).filter(Boolean)
    )
    const [alreadyMember, setAlreadyMember] = useState(false)
    const [alreadyRequested, setAlreadyRequested] = useState(false)

    const router = useRouter()

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

    // Sync state when props change
    useEffect(() => {
        setMemberGroupIds(initialOrganizations.map(o => o.scope_id || o.id))
        setPendingGroupIds(initialPendingRequests.map(r => r.group?.id).filter(Boolean))
    }, [initialOrganizations, initialPendingRequests])

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

    // Update status when group is selected
    useEffect(() => {
        if (!selectedGroupId) {
            setAlreadyMember(false)
            setAlreadyRequested(false)
            return
        }

        setAlreadyMember(memberGroupIds.includes(selectedGroupId))
        setAlreadyRequested(pendingGroupIds.includes(selectedGroupId))
    }, [selectedGroupId, memberGroupIds, pendingGroupIds])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        if (!selectedGroupId || !roleType) {
            setError("Please select a group and role type")
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error("You must be logged in to join a group")
            }

            // Create a join request
            const { error: insertError } = await supabase
                .from('group_join_requests')
                .insert({
                    user_id: user.id,
                    group_id: selectedGroupId,
                    requested_role: roleType,
                    message: message || null,
                    status: 'pending'
                })

            if (insertError) {
                // Handle specific duplicate key error
                if (insertError.code === '23505') {
                    throw new Error("You already have a pending request for this group")
                }
                throw insertError
            }

            setSuccess(true)
            setSelectedGroupId("")
            setRoleType("")
            setMessage("")
            setGroupSearchQuery("")

            // Refresh the router to update the PendingRequests component
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Failed to submit request")
        } finally {
            setLoading(false)
        }
    }

    const selectedGroup = allGroups.find(g => g.id === selectedGroupId)

    if (success) {
        return (
            <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <UserPlus className="h-5 w-5" />
                        <CardTitle>Request Submitted!</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Your request to join the group has been sent to the group administrators.
                        They will review your request and you'll be notified once it's been approved.
                    </p>
                    <Button
                        onClick={() => setSuccess(false)}
                        variant="outline"
                        className="w-full"
                    >
                        Submit Another Request
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Join a Group</CardTitle>
                <CardDescription>
                    Here you can apply to join a Group as a Scouter, Parent/Guardian, or both.
                    Joining a County or Province is by invite only.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {alreadyMember && (
                        <div className="p-3 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-md text-sm border border-blue-100 dark:border-blue-800">
                            You are already a member of this group.
                        </div>
                    )}

                    {alreadyRequested && (
                        <div className="p-3 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-md text-sm border border-amber-100 dark:border-amber-800">
                            You have a pending request to join this group.
                        </div>
                    )}

                    {/* Group Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="group">Select Group *</Label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                                className={cn(
                                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                    !selectedGroupId && "text-muted-foreground"
                                )}
                                disabled={loading}
                            >
                                {selectedGroup ? (
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
                                    <span>Select a group</span>
                                )}
                                <Search className="h-4 w-4 opacity-50 ml-2 shrink-0" />
                            </button>

                            {isGroupDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-hidden flex flex-col">
                                    <div className="p-2 border-b sticky top-0 bg-popover">
                                        <div className="flex items-center border rounded-md px-2">
                                            <Search className="h-4 w-4 text-muted-foreground mr-2" />
                                            <input
                                                type="text"
                                                placeholder="Search groups..."
                                                value={groupSearchQuery}
                                                onChange={(e) => setGroupSearchQuery(e.target.value)}
                                                className="w-full border-0 bg-transparent focus:outline-none h-8 px-0 text-sm"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-y-auto">
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
                                                        setSelectedGroupId(group.id)
                                                        setIsGroupDropdownOpen(false)
                                                        setGroupSearchQuery("")
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center px-3 py-2 hover:bg-accent transition-colors text-left",
                                                        selectedGroupId === group.id && "bg-accent"
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

                    {/* Role Type Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Role Type *</Label>
                        <Select
                            value={roleType}
                            onValueChange={setRoleType}
                            disabled={loading || !selectedGroupId}
                        >
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="scouter">Scouter</SelectItem>
                                <SelectItem value="parent">Parent/Guardian</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Optional Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                            id="message"
                            placeholder="Add any additional information for the group administrators..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                            You can include information about your experience, why you'd like to join, etc.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !selectedGroupId || !roleType || alreadyMember || alreadyRequested}
                    >
                        {loading ? "Submitting..." : (alreadyRequested ? "Request Pending" : (alreadyMember ? "Already a Member" : "Submit Request"))}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
