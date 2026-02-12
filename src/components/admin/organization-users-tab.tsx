'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, UserPlus, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AddOrganizationMemberDialog } from './add-organization-member-dialog'
import { InviteUserDialog } from './invite-user-dialog'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JoinRequestsCounter } from '../groups/join-requests-counter'

interface OrganizationMember {
    id: string
    user_id: string
    user_email: string | null
    user_name: string | null
    permissions: {
        org_details: boolean
        news: boolean
        events: boolean
        financial: boolean
        store: boolean
        admin: boolean
        section_id?: string | null
        is_section_lead?: boolean
    }
    role: string
    section_name?: string
}

interface OrganizationUsersTabProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team'
    organizationName: string
}

export function OrganizationUsersTab({
    organizationId,
    organizationType,
    organizationName,
}: OrganizationUsersTabProps) {
    const [members, setMembers] = useState<OrganizationMember[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        loadMembers()
    }, [organizationId, organizationType])

    const loadMembers = async () => {
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/members`
            )
            if (!response.ok) throw new Error('Failed to load members')
            const data = await response.json()
            setMembers(data.members || [])
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    // Filter members by role
    const scouters = useMemo(() =>
        members.filter(m => m.role === 'scouter' || m.role === 'group_leader'),
        [members]
    )

    const parents = useMemo(() =>
        members.filter(m => m.role === 'parent'),
        [members]
    )

    const handlePermissionChange = async (
        member: OrganizationMember,
        permissionKey: string,
        value: boolean
    ) => {
        // Optimistic update
        const updatedPermissions = { ...member.permissions, [permissionKey]: value }

        if (permissionKey === 'admin' && value === true) {
            updatedPermissions.org_details = true
            updatedPermissions.news = true
            updatedPermissions.events = true
            updatedPermissions.financial = true
            updatedPermissions.store = true
        }

        // If any specific permission is unticked, untick admin
        if (value === false && permissionKey !== 'admin') {
            updatedPermissions.admin = false
        }

        const updatedMembers = members.map(m =>
            m.id === member.id ? { ...m, permissions: updatedPermissions } : m
        )
        setMembers(updatedMembers)

        try {
            // Use member.id (Role ID) instead of user_id
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/members/${member.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                    },
                    body: JSON.stringify({ permissions: updatedPermissions }),
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update permission')
            }

            toast({
                title: "Saved",
                description: "Permission updated successfully.",
                duration: 2000
            })

        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
            // Revert changes on error
            loadMembers()
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/members/${memberId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                    },
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to remove member')
            }

            setMembers(prev => prev.filter(m => m.id !== memberId))
            toast({
                title: "Member Removed",
                description: "User removed from organization."
            })
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }
    }

    const renderMembersTable = (membersList: OrganizationMember[], emptyMessage: string) => {
        if (loading) {
            return <p className="text-muted-foreground">Loading members...</p>
        }

        if (membersList.length === 0) {
            return <p className="text-muted-foreground">{emptyMessage}</p>
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">User</TableHead>
                        {organizationType === 'group' && <TableHead>Section</TableHead>}
                        <TableHead className="text-center">Details</TableHead>
                        <TableHead className="text-center">News</TableHead>
                        <TableHead className="text-center">Events</TableHead>
                        <TableHead className="text-center">Finance</TableHead>
                        <TableHead className="text-center">Store</TableHead>
                        <TableHead className="text-center">Admin</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {membersList.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell>
                                <div>
                                    <div className="font-medium">
                                        {member.user_name || 'Unknown User'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {member.user_email}
                                    </div>
                                    {member.permissions.is_section_lead && (
                                        <Badge variant="outline" className="mt-1 text-xs border-primary text-primary">Lead</Badge>
                                    )}
                                </div>
                            </TableCell>
                            {organizationType === 'group' && (
                                <TableCell>
                                    {member.section_name ? (
                                        ['Beavers', 'Cubs', 'Scouts', 'Ventures', 'Rovers'].find(type => member.section_name!.includes(type)) || member.section_name
                                    ) : '-'}
                                    {member.permissions.section_id && !member.section_name && 'Unknown Section'}
                                </TableCell>
                            )}
                            <TableCell className="text-center">
                                <Checkbox
                                    checked={member.permissions.org_details}
                                    onCheckedChange={(c) => handlePermissionChange(member, 'org_details', !!c)}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                                <Checkbox
                                    checked={member.permissions.news}
                                    onCheckedChange={(c) => handlePermissionChange(member, 'news', !!c)}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                                <Checkbox
                                    checked={member.permissions.events}
                                    onCheckedChange={(c) => handlePermissionChange(member, 'events', !!c)}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                                <Checkbox
                                    checked={member.permissions.financial}
                                    onCheckedChange={(c) => handlePermissionChange(member, 'financial', !!c)}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                                <Checkbox
                                    checked={member.permissions.store}
                                    onCheckedChange={(c) => handlePermissionChange(member, 'store', !!c)}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                                <Checkbox
                                    checked={member.permissions.admin}
                                    onCheckedChange={(c) => handlePermissionChange(member, 'admin', !!c)}
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="scouters" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="scouters">
                        Scouters ({scouters.length})
                    </TabsTrigger>
                    <TabsTrigger value="parents">
                        Parents ({parents.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="scouters" className="space-y-4 mt-6">
                    <div className="flex justify-end gap-2">
                        <AddOrganizationMemberDialog
                            organizationId={organizationId}
                            organizationType={organizationType}
                            organizationName={organizationName}
                            onMemberAdded={loadMembers}
                            role="scouter"
                            triggerButton={
                                <Button variant="outline">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Scouter
                                </Button>
                            }
                        />
                        {organizationType === 'group' && (
                            <Button variant="outline" asChild className="relative">
                                <a href={`/scouter/organizations/${organizationId}/join-requests`}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Review Requests
                                    <JoinRequestsCounter
                                        organizationId={organizationId}
                                        className="absolute -top-2 -right-2"
                                    />
                                </a>
                            </Button>
                        )}
                        <InviteUserDialog
                            organizationId={organizationId}
                            organizationType={organizationType}
                            organizationName={organizationName}
                            role="scouter"
                            onInviteSent={loadMembers}
                            triggerButton={
                                <Button variant="default">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Invite New User
                                </Button>
                            }
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Scouters</CardTitle>
                            <CardDescription>
                                Manage scouter permissions for {organizationName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderMembersTable(
                                scouters,
                                "No scouters yet. Add or invite a scouter to get started."
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="parents" className="space-y-4 mt-6">
                    <div className="flex justify-end gap-2">
                        <AddOrganizationMemberDialog
                            organizationId={organizationId}
                            organizationType={organizationType}
                            organizationName={organizationName}
                            onMemberAdded={loadMembers}
                            role="parent"
                            triggerButton={
                                <Button variant="outline">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Parent
                                </Button>
                            }
                        />
                        {organizationType === 'group' && (
                            <Button variant="outline" asChild className="relative">
                                <a href={`/scouter/organizations/${organizationId}/join-requests`}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Review Requests
                                    <JoinRequestsCounter
                                        organizationId={organizationId}
                                        className="absolute -top-2 -right-2"
                                    />
                                </a>
                            </Button>
                        )}
                        <InviteUserDialog
                            organizationId={organizationId}
                            organizationType={organizationType}
                            organizationName={organizationName}
                            role="parent"
                            onInviteSent={loadMembers}
                            triggerButton={
                                <Button variant="default">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Invite New User
                                </Button>
                            }
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Parents</CardTitle>
                            <CardDescription>
                                Manage parent permissions for {organizationName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderMembersTable(
                                parents,
                                "No parents yet. Add or invite a parent to get started."
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
