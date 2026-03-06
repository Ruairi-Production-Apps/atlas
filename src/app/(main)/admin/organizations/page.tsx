import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getProvinces, getCounties, getGroups, getAdventureTeams } from "@/lib/supabase/queries"
import Link from "next/link"
import { OrganizationRow } from "@/components/admin/organization-row"
import { DeleteSuccessMessage } from "@/components/admin/delete-success-message"
import { AddOrganizationButton } from "@/components/admin/add-organization-button"
import { OrganizationsTabs } from "@/components/admin/organizations-tabs"
import { Suspense } from "react"

export default async function OrganizationsPage() {
    const provinces = await getProvinces()
    const counties = await getCounties()
    const groups = await getGroups()
    const teams = await getAdventureTeams()

    const provincesContent = (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-semibold">Provinces</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage provinces and their administrators
                    </p>
                </div>
                <Suspense fallback={null}>
                    <AddOrganizationButton />
                </Suspense>
            </div>
            <Card>
                <CardContent className="pt-6">
                    {provinces.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No provinces found. <Link href="/admin/organizations/new?type=province" className="text-primary hover:underline">Create your first province</Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Website</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {provinces.map((province) => (
                                    <OrganizationRow
                                        key={province.id}
                                        id={province.id}
                                        name={province.name}
                                        type="province"
                                        description={province.description}
                                        email={province.email}
                                        website={province.website}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    )

    const countiesContent = (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-semibold">Counties</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage counties and their administrators
                    </p>
                </div>
                <Suspense fallback={null}>
                    <AddOrganizationButton />
                </Suspense>
            </div>
            <Card>
                <CardContent className="pt-6">
                    {counties.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No counties found. <Link href="/admin/organizations/new?type=county" className="text-primary hover:underline">Create your first county</Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Province</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {counties.map((county) => (
                                    <OrganizationRow
                                        key={county.id}
                                        id={county.id}
                                        name={county.name}
                                        type="county"
                                        description={county.description}
                                        email={county.email}
                                        provinceName={provinces.find(p => p.id === county.province_id)?.name}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    )

    const groupsContent = (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-semibold">Groups</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage groups and their administrators
                    </p>
                </div>
                <Suspense fallback={null}>
                    <AddOrganizationButton />
                </Suspense>
            </div>
            <Card>
                <CardContent className="pt-6">
                    {groups.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No groups found. <Link href="/admin/organizations/new?type=group" className="text-primary hover:underline">Create your first group</Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>County</TableHead>
                                    <TableHead>Province</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groups.map((group) => {
                                    const county = counties.find(c => c.id === group.county_id)
                                    const province = county ? provinces.find(p => p.id === county.province_id) : null
                                    return (
                                        <OrganizationRow
                                            key={group.id}
                                            id={group.id}
                                            name={group.name}
                                            type="group"
                                            description={group.description}
                                            countyName={county?.name}
                                            provinceName={province?.name}
                                        />
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    )

    const teamsContent = (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-semibold">Adventure Skills Teams</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage adventure skills teams and their administrators
                    </p>
                </div>
                <Suspense fallback={null}>
                    <AddOrganizationButton />
                </Suspense>
            </div>
            <Card>
                <CardContent className="pt-6">
                    {teams.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No teams found. <Link href="/admin/organizations/new?type=team" className="text-primary hover:underline">Create your first team</Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Website</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teams.map((team) => (
                                    <OrganizationRow
                                        key={team.id}
                                        id={team.id}
                                        name={team.name}
                                        type="team"
                                        description={team.description}
                                        email={team.email}
                                        website={team.website}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    )

    return (
        <div>
            <Suspense fallback={null}>
                <DeleteSuccessMessage />
            </Suspense>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Organizations</h1>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <OrganizationsTabs
                    provincesCount={provinces.length}
                    countiesCount={counties.length}
                    groupsCount={groups.length}
                    teamsCount={teams.length}
                    provincesContent={provincesContent}
                    countiesContent={countiesContent}
                    groupsContent={groupsContent}
                    teamsContent={teamsContent}
                />
            </Suspense>
        </div>
    )
}
