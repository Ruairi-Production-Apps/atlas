import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Shield, Building2, FileText } from "lucide-react"

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Organizations
                        </CardTitle>
                        <CardDescription>
                            Manage provinces, counties, and groups
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/admin/organizations">View Organizations</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            User Management
                        </CardTitle>
                        <CardDescription>
                            View and manage all users in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/admin/users">View Users</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add New User
                        </CardTitle>
                        <CardDescription>
                            Create a new user and assign roles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/admin/users/new">Add User</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            System Admin
                        </CardTitle>
                        <CardDescription>
                            Full system administration access
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            You have full system administration privileges.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Knowledgebase
                        </CardTitle>
                        <CardDescription>
                            Manage all articles and content
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/admin/knowledgebase">Manage Articles</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Events
                        </CardTitle>
                        <CardDescription>
                            Manage all events and create National events
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/admin/events">Manage Events</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            News
                        </CardTitle>
                        <CardDescription>
                            Manage all news and create National news
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/admin/news">Manage News</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

