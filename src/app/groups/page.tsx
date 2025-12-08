import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getGroups } from "@/lib/supabase/queries"

export default async function GroupsPage() {
    const groups = await getGroups()

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <img src="/images/atlas/groups-badge.png" alt="Groups" className="h-12 w-12 object-contain" />
                    <h1 className="text-4xl font-bold">Groups</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-12">
                    Connect with local scouting groups
                </p>

                {groups.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No groups found. Please add groups via the admin dashboard.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groups.map((group) => (
                            <Link key={group.id} href={`/groups/${group.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            {group.logo_url && (
                                                <img
                                                    src={group.logo_url}
                                                    alt={`${group.name} logo`}
                                                    className="w-16 h-16 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <CardTitle>{group.name}</CardTitle>
                                                {group.description && (
                                                    <CardDescription className="line-clamp-2">
                                                        {group.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {(group.email || group.website) && (
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                {group.email && <p>Email: {group.email}</p>}
                                                {group.website && <p>Website: {group.website}</p>}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
