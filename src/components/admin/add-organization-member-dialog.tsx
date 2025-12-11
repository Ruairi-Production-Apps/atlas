"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Search, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface AddOrganizationMemberDialogProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team'
    organizationName: string
    onMemberAdded: () => void
}

export function AddOrganizationMemberDialog({
    organizationId,
    organizationType,
    organizationName,
    onMemberAdded
}: AddOrganizationMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<1 | 2>(1)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [activeSections, setActiveSections] = useState<any[]>([])
    const { toast } = useToast()
    const supabase = createClient()

    // Permissions State
    const [permissions, setPermissions] = useState({
        org_details: false,
        news: false,
        events: false,
        financial: false,
        store: false,
        admin: false // If true, implies full access
    })

    // Group Specific State
    const [selectedSection, setSelectedSection] = useState<string>("none")
    const [isSectionLead, setIsSectionLead] = useState(false)

    useEffect(() => {
        if (open && organizationType === 'group') {
            loadSections()
        }
    }, [open, organizationType])

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch()
            } else {
                setSearchResults([])
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const loadSections = async () => {
        const { data } = await supabase
            .from('sections')
            .select('id, name, section_type')
            .eq('group_id', organizationId)

        if (data) setActiveSections(data)
    }

    const performSearch = async () => {
        setSearching(true)
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
            const data = await res.json()
            setSearchResults(data.users || [])
        } catch (error) {
            console.error(error)
        } finally {
            setSearching(false)
        }
    }

    const handleUserSelect = (user: any) => {
        setSelectedUser(user)
        setStep(2)
    }

    const handleAddMember = async () => {
        setLoading(true)
        try {
            // Construct permissions object
            // If admin is selected, it might override others effectively on backend, 
            // but we store what was checked.
            const permissionsPayload = {
                ...permissions,
                section_id: selectedSection === "none" ? null : selectedSection,
                is_section_lead: isSectionLead
            }

            // Determine role: if admin checkbox -> 'group_leader' (or relevant admin role), 
            // else if lead -> 'section_leader' or 'scouter'
            // But per request "all orgs... select permissions".
            // Implementation: We use 'scouter' as base role if just member, 
            // 'group_leader' if admin permission is checked? 
            // Actually, keep it simple: Use 'scouter' for everyone added this way unless they are main admin?
            // Existing logic uses roles like 'group_leader'.
            // If 'Admin' permission is checked, we should probably set role='group_leader' (or type equivalent).
            // Else 'scouter'.

            let role = 'scouter'
            if (permissions.admin) {
                if (organizationType === 'group') role = 'group_leader'
                else if (organizationType === 'county') role = 'county_admin'
                else if (organizationType === 'province') role = 'provincial_admin'
                else if (organizationType === 'team') role = 'team_admin'
            } else if (isSectionLead && selectedSection !== "none") {
                role = 'section_leader' // Although this requires scope_type='section' usually?
                // If we use scope_type='group', we can stick to 'scouter' + metadata.
                // But legacy code might rely on 'section_leader'.
                // For now, let's use 'scouter' if 'admin' is false, to rely on permissions JSON.
                role = 'scouter'
            }

            const response = await fetch(`/api/organizations/${organizationType}/${organizationId}/members/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    role, // or let backend decide based on permissions? Let's pass permissions.
                    permissions: permissionsPayload
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to add member")

            toast({
                title: "Member Added",
                description: `${selectedUser.first_name} has been added to the organization.`
            })
            setOpen(false)
            resetForm()
            onMemberAdded()

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setSelectedUser(null)
        setSearchQuery("")
        setPermissions({
            org_details: false,
            news: false,
            events: false,
            financial: false,
            store: false,
            admin: false
        })
        setSelectedSection("none")
        setIsSectionLead(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Member to {organizationName}</DialogTitle>
                    <DialogDescription>
                        {step === 1 ? "Search for an existing user to add." : "Configure permissions for the new member."}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="border rounded-md min-h-[200px] max-h-[300px] overflow-y-auto">
                            {searching ? (
                                <div className="p-4 text-center text-muted-foreground">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="divide-y">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            className="p-3 hover:bg-muted cursor-pointer flex items-center gap-3"
                                            onClick={() => handleUserSelect(user)}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                {user.first_name?.[0]}{user.last_name?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.first_name} {user.last_name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-muted-foreground">
                                    {searchQuery.length < 2 ? "Type at least 2 characters to search" : "No users found"}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && selectedUser && (
                    <div className="space-y-6 py-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                                {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                            </div>
                            <div>
                                <div className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</div>
                                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setStep(1)}>Change</Button>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Permissions</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="p-details"
                                        checked={permissions.org_details}
                                        onCheckedChange={(c) => setPermissions(p => ({ ...p, org_details: !!c }))}
                                    />
                                    <Label htmlFor="p-details">Organisation Details</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="p-news"
                                        checked={permissions.news}
                                        onCheckedChange={(c) => setPermissions(p => ({ ...p, news: !!c }))}
                                    />
                                    <Label htmlFor="p-news">News</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="p-events"
                                        checked={permissions.events}
                                        onCheckedChange={(c) => setPermissions(p => ({ ...p, events: !!c }))}
                                    />
                                    <Label htmlFor="p-events">Events</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="p-financial"
                                        checked={permissions.financial}
                                        onCheckedChange={(c) => setPermissions(p => ({ ...p, financial: !!c }))}
                                    />
                                    <Label htmlFor="p-financial">Financial</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="p-store"
                                        checked={permissions.store}
                                        onCheckedChange={(c) => setPermissions(p => ({ ...p, store: !!c }))}
                                    />
                                    <Label htmlFor="p-store">Store</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="p-admin"
                                        checked={permissions.admin}
                                        onCheckedChange={(c) => setPermissions(p => ({
                                            ...p,
                                            admin: !!c,
                                            // Auto-select all if admin? Or let user decide?
                                            // Usually admin implies all. Let's auto-select for UX
                                            org_details: !!c ? true : p.org_details,
                                            news: !!c ? true : p.news,
                                            events: !!c ? true : p.events,
                                            financial: !!c ? true : p.financial,
                                            store: !!c ? true : p.store
                                        }))}
                                    />
                                    <Label htmlFor="p-admin" className="font-bold">Admin (Full Access)</Label>
                                </div>
                            </div>
                        </div>

                        {organizationType === 'group' && (
                            <div className="space-y-4 pt-4 border-t">
                                <Label className="text-base font-semibold">Group Role</Label>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Assigned Section</Label>
                                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No specific section</SelectItem>
                                                {activeSections.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.section_type.charAt(0).toUpperCase() + s.section_type.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="p-lead"
                                            checked={isSectionLead}
                                            onCheckedChange={(c) => setIsSectionLead(!!c)}
                                            disabled={selectedSection === "none"}
                                        />
                                        <Label htmlFor="p-lead">Section Lead</Label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {step === 2 && (
                        <div className="flex w-full justify-between">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={handleAddMember} disabled={loading}>
                                {loading ? "Adding..." : "Add Member"}
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
