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
                        {isInstance() && homeOrg && (
                            <Card className="border-primary/20 shadow-md">
                                <CardHeader className="bg-primary/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {organizations[0]?.logo_url ? (
                                                <img
                                                    src={organizations[0].logo_url}
                                                    alt="Organization Logo"
                                                    className="w-16 h-16 object-contain border rounded-md bg-white p-2"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 border border-dashed rounded-md bg-muted flex items-center justify-center">
                                                    <Building2 className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div>
                                                <CardTitle className="text-2xl">{organizations[0]?.name || homeOrg.site_title}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline">{getTypeDisplay(homeOrg.type)}</Badge>
                                                    <Badge variant="secondary">{getRoleDisplay(organizations[0]?.role || 'Member')}</Badge>
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" asChild>
                                                <Link href={organizations[0] ? getOrganizationUrl(organizations[0]) : '/'}>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Visit Site
                                                </Link>
                                            </Button>
                                            {isSysadmin && (
                                                <>
                                                    <Button asChild>
                                                        <Link href={`/scouter/organizations/${homeOrg.id}/edit?type=${homeOrg.type}`}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Manage
                                                        </Link>
                                                    </Button>
                                                    <Button variant="secondary" asChild>
                                                        <Link href="/scouter/site-settings">
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Settings
                                                        </Link>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground tracking-wider">Description</h4>
                                    <p className="text-foreground">
                                        {organizations[0]?.description || "Your organization is ready for management. Use the tools above to update details, members, and more."}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {(!isInstance() || !homeOrg) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{manageDisplayText}</CardTitle>
                                    <CardDescription>
                                        Organizations you are a member of
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {organizations.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg mb-2">No organizations found</p>
                                            <p className="text-sm">
                                                You haven't been assigned to any organizations yet.
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
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {organizations.map((org) => (
                                                    <TableRow key={`${org.type}-${org.id}`}>
                                                        <TableCell>
                                                            {org.logo_url ? (
                                                                <img src={org.logo_url} alt="" className="w-10 h-10 object-contain rounded border bg-white p-1" />
                                                            ) : (
                                                                <Building2 className="w-10 h-10 p-2 text-muted-foreground bg-muted rounded" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{org.name}</TableCell>
                                                        <TableCell><Badge variant="outline">{getTypeDisplay(org.type)}</Badge></TableCell>
                                                        <TableCell><Badge variant="secondary">{getRoleDisplay(org.role)}</Badge></TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={getOrganizationUrl(org)}>View</Link>
                                                            </Button>
                                                            {(org.role === 'sysadmin' || org.role === 'provincial_admin' || org.role === 'county_admin' || org.role === 'group_leader') && (
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link href={`/scouter/organizations/${org.id}/edit?type=${org.type}`}>Manage</Link>
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        )}

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
