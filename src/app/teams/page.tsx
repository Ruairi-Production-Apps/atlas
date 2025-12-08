import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdventureTeams } from "@/lib/supabase/queries"

export default async function TeamsPage() {
    const teams = await getAdventureTeams()

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <img src="/images/atlas/skills-teams-badges.png" alt="Adventure Skills Teams" className="h-12 w-12 object-contain" />
                    <h1 className="text-4xl font-bold">Adventure Skills Teams</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-12">
                    Explore Adventure Skills Teams and their activities
                </p>

                {teams.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No teams found. Please add teams via the admin dashboard.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {teams.map((team) => (
                            <Link key={team.id} href={`/teams/${team.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            {team.logo_url && (
                                                <img
                                                    src={team.logo_url}
                                                    alt={`${team.name} logo`}
                                                    className="w-16 h-16 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <CardTitle>{team.name}</CardTitle>
                                                {team.description && (
                                                    <CardDescription className="line-clamp-2">
                                                        {team.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {(team.email || team.website) && (
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                {team.email && <p>Email: {team.email}</p>}
                                                {team.website && <p>Website: {team.website}</p>}
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
