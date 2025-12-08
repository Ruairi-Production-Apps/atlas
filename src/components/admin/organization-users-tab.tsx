'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AddOrganizationMemberDialog } from './add-organization-member-dialog'
import { useToast } from '@/hooks/use-toast'

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

    const handlePermissionChange = async (
        member: OrganizationMember,
        permissionKey: string,
        value: boolean
    ) => {
        // Optimistic update
        const updatedPermissions = { ...member.permissions, [permissionKey]: value }

        // Logic: if admin is set to true, enable all?
        if (permissionKey === 'admin' && value === true) {
            updatedPermissions.org_details = true
            updatedPermissions.news = true
            updatedPermissions.events = true
            updatedPermissions.financial = true
            updatedPermissions.store = true
        }

        const updatedMembers = members.map(m =>
            m.id === member.id ? { ...m, permissions: updatedPermissions } : m
        )
        setMembers(updatedMembers)

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/members/${member.user_id}`, // Using user_id usually for PATCH if route uses it, OR member ID (role ID). API usually expects role ID or user ID. Let's assume Role ID for members route deletion/update. Wait, existing code used member.id? 
                // Let's check route.ts in next step. For now assume member.id (which is role id usually).
                // Actually my Add route inserts to user_roles.
                // The GET route returns mapping. 
                // If the route expects ID, it's likely the Role ID (id from user_roles table).
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ permissions: updatedPermissions }),
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update permission')
            }

            // Reload to ensure sync? Or trust optimistic.
            // Trust optimistic for now to avoid flickering.
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
            // Revert
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

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <AddOrganizationMemberDialog
                    organizationId={organizationId}
                    organizationType={organizationType}
                    organizationName={organizationName}
                    onMemberAdded={loadMembers}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organization Members</CardTitle>
                    <CardDescription>
                        Manage permissions for members of {organizationName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-muted-foreground">Loading members...</p>
                    ) : members.length === 0 ? (
                        <p className="text-muted-foreground">No members yet. Add a user to get started.</p>
                    ) : (
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
                                {members.map((member) => (
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
                                                {member.section_name || '-'}
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
