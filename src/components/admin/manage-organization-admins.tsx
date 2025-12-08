"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { UserWithRoles } from "@/lib/admin/queries"

interface ManageOrganizationAdminsProps {
    organizationId: string
    organizationName: string
    organizationType: 'province' | 'county' | 'group'
    users: UserWithRoles[]
    currentAdminIds: string[]
}

export function ManageOrganizationAdmins({
    organizationId,
    organizationName,
    organizationType,
    users,
    currentAdminIds,
}: ManageOrganizationAdminsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set(currentAdminIds))

    const getRoleForType = (type: string) => {
        if (type === 'province') return 'provincial_admin'
        if (type === 'county') return 'county_admin'
        if (type === 'group') return 'group_leader'
        return 'section_leader'
    }

    const handleToggleUser = (userId: string) => {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(userId)) {
                newSet.delete(userId)
            } else {
                newSet.add(userId)
            }
            return newSet
        })
    }

    const handleSave = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/organizations/${organizationType}/${organizationId}/admins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_ids: Array.from(selectedUserIds),
                    role: getRoleForType(organizationType),
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update admins')
            }

            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Administrators</CardTitle>
                <CardDescription>
                    Select users to assign as administrators for {organizationName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm mb-4">
                        {error}
                    </div>
                )}

                {users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No users found. <a href="/admin/users/new" className="text-primary hover:underline">Create a user first</a>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Current Roles</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedUserIds.has(user.id)}
                                                onChange={() => handleToggleUser(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {user.first_name && user.last_name
                                                ? `${user.first_name} ${user.last_name}`
                                                : user.email}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.roles.length === 0 ? (
                                                <span className="text-muted-foreground text-sm">No roles</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <span
                                                            key={role.id}
                                                            className="text-xs px-2 py-1 bg-muted rounded-full"
                                                        >
                                                            {role.role.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex justify-end gap-4 mt-6">
                            <Button variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

