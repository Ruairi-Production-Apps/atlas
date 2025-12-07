import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getAllUsers } from "@/lib/admin/queries"
import Link from "next/link"
import { UserPlus, Edit } from "lucide-react"
import { ImpersonateButton } from "@/components/admin/impersonate-button"

export default async function UsersPage() {
    const users = await getAllUsers()

    const formatRole = (role: string) => {
        return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const formatScope = (scopeType: string) => {
        return scopeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Users</h1>
                <Button asChild>
                    <Link href="/admin/users/new">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        Manage users and their roles. Click "Log in as" to impersonate a user.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No users found. <Link href="/admin/users/new" className="text-primary hover:underline">Add your first user</Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.full_name || 'No name'}
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
                                                            {formatRole(role.role)} ({formatScope(role.scope_type)})
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/admin/users/${user.id}/edit`}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit User
                                                    </Link>
                                                </Button>
                                                <ImpersonateButton userId={user.id} />
                                            </div>
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

