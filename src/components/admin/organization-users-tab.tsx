'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { UserPlus, Mail, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface OrganizationMember {
    id: string
    user_id: string
    user_email: string | null
    user_name: string | null
    can_manage_news: boolean
    can_manage_events: boolean
    can_edit_details: boolean
}

interface OrganizationUsersTabProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group'
    organizationName: string
}

export function OrganizationUsersTab({
    organizationId,
    organizationType,
    organizationName,
}: OrganizationUsersTabProps) {
    const [members, setMembers] = useState<OrganizationMember[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setInviting(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/members/invite`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: inviteEmail }),
                }
            )

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to invite user')

            setInviteEmail('')
            await loadMembers()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setInviting(false)
        }
    }

    const handlePermissionChange = async (
        memberId: string,
        permission: 'can_manage_news' | 'can_manage_events' | 'can_edit_details',
        value: boolean
    ) => {
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/members/${memberId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [permission]: value }),
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update permission')
            }

            await loadMembers()
        } catch (err: any) {
            setError(err.message)
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

            await loadMembers()
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invite Scouter</CardTitle>
                    <CardDescription>
                        Invite a Scouter to join {organizationName} and assign permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleInvite} className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                type="email"
                                placeholder="scouter@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={inviting}>
                            <Mail className="h-4 w-4 mr-2" />
                            {inviting ? 'Inviting...' : 'Send Invite'}
                        </Button>
                    </form>
                    {error && (
                        <p className="text-sm text-destructive mt-2">{error}</p>
                    )}
                </CardContent>
            </Card>

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
                        <p className="text-muted-foreground">No members yet. Invite someone to get started.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Manage News</TableHead>
                                    <TableHead>Manage Events</TableHead>
                                    <TableHead>Edit Details</TableHead>
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
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={member.can_manage_news}
                                                onChange={(e) =>
                                                    handlePermissionChange(
                                                        member.id,
                                                        'can_manage_news',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={member.can_manage_events}
                                                onChange={(e) =>
                                                    handlePermissionChange(
                                                        member.id,
                                                        'can_manage_events',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={member.can_edit_details}
                                                onChange={(e) =>
                                                    handlePermissionChange(
                                                        member.id,
                                                        'can_edit_details',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
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

