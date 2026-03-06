import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getHomeOrgConfig } from '@/lib/supabase/queries'
import { getUserOrganizations, getUserPendingRequests, getUserSavedEvents } from '@/lib/supabase/scouter-queries'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Building2, ExternalLink, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KnowledgebaseManager } from '@/components/scouter/knowledgebase-manager'
import { JoinGroupForm } from '@/components/dashboard/join-group-form'
import { PendingRequests } from '@/components/dashboard/pending-requests'
import { SavedEvents } from '@/components/dashboard/saved-events'
import { isInstance, APP_CONFIG, isHub } from '@/lib/config/app-config'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { tab } = await searchParams
    const activeTab = typeof tab === 'string' ? tab : 'organizations'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    let organizations = await getUserOrganizations(supabase)
    const pendingRequests = await getUserPendingRequests(supabase)
    const savedEvents = await getUserSavedEvents(supabase)

    // In Instance mode, only show the Home Organization
    const homeOrg = isInstance() ? await getHomeOrgConfig() : null;
    if (homeOrg) {
        organizations = organizations.filter(org => org.id === homeOrg.id)
    }

    const getTypeDisplay = (type: string) => {
        if (type === 'adventure_team') return 'Adventure Team'
        return type.charAt(0).toUpperCase() + type.slice(1)
    }

    const getRoleDisplay = (role: string) => {
        const roleMap: Record<string, string> = {
            'provincial_admin': 'Provincial Admin',
            'county_admin': 'County Admin',
            'group_leader': 'Group Leader',
            'section_leader': 'Section Leader',
        }
        return roleMap[role] || 'Member'
    }

    const getOrganizationUrl = (org: { type: string; slug: string }) => {
        if (org.type === 'province') return `/provinces/${org.slug}`
        if (org.type === 'county') return `/counties/${org.slug}`
        if (org.type === 'group') return `/groups/${org.slug}`
        if (org.type === 'adventure_team') return `/teams/${org.slug}`
        return '#'
    }

    const isSysadmin = organizations.some(o => o.role === 'sysadmin')

    const orgDisplayText = isInstance() ? 'Organisation' : 'Organizations'
    const manageDisplayText = isInstance() ? 'Manage Organisation' : 'My Organizations'

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    {isInstance() ? 'Manage your scouting activities and organization' : 'Your organizations and scouting activities'}
                </p>
            </div>

            <Tabs defaultValue={activeTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="organizations">{manageDisplayText}</TabsTrigger>
                    <TabsTrigger value="saved-events">Saved Events</TabsTrigger>
                    <TabsTrigger value="knowledgebase">Knowledgebase</TabsTrigger>
                </TabsList>

                <TabsContent value="organizations">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{manageDisplayText}</CardTitle>
                                <CardDescription>
                                    {isInstance() ? 'View and manage your organization details' : 'Organizations you are a member of'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {organizations.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg mb-2">No {isInstance() ? 'organisation' : 'organizations'} found</p>
                                        <p className="text-sm">
                                            {isInstance()
                                                ? "You don't have administrative access to this instance yet."
                                                : "You haven't been assigned to any organizations yet."}
                                        </p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16">Logo</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {organizations.map((org) => (
                                                <TableRow key={`${org.type}-${org.id}`}>
                                                    <TableCell>
                                                        {org.logo_url ? (
                                                            <img
                                                                src={org.logo_url}
                                                                alt={`${org.name} logo`}
                                                                className="w-12 h-12 object-contain border border-input rounded-md bg-muted p-1"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 border border-dashed border-input rounded-md bg-muted flex items-center justify-center">
                                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{org.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {getTypeDisplay(org.type)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {getRoleDisplay(org.role)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-md truncate">
                                                        {org.description || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={getOrganizationUrl(org)}>
                                                                    View
                                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                                </Link>
                                                            </Button>
                                                            {!isHub() && (org.role === 'sysadmin' || org.role === 'provincial_admin' || org.role === 'county_admin' || org.role === 'group_leader') && (
                                                                <>
                                                                    <Link href={`/scouter/organizations/${org.id}/edit?type=${org.type}`}>
                                                                        <Button variant="outline" size="sm">
                                                                            <Edit className="h-4 w-4 mr-1" />
                                                                            Manage
                                                                        </Button>
                                                                    </Link>
                                                                    {isInstance() && (
                                                                        <Link href="/scouter/site-settings">
                                                                            <Button variant="outline" size="sm">
                                                                                <Edit className="h-4 w-4 mr-1" />
                                                                                Site Settings
                                                                            </Button>
                                                                        </Link>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {isHub() && (
                            <>
                                <JoinGroupForm initialOrganizations={organizations} initialPendingRequests={pendingRequests} />
                                <PendingRequests initialRequests={pendingRequests} />
                            </>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="saved-events">
                    <SavedEvents initialEvents={savedEvents} userId={user.id} />
                </TabsContent>

                <TabsContent value="knowledgebase">
                    <KnowledgebaseManager user={user} organizations={organizations} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
