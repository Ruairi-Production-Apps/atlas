import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCounties } from "@/lib/supabase/queries"

export default async function CountiesPage() {
    const counties = await getCounties()

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">Counties</h1>
                <p className="text-lg text-muted-foreground mb-12">
                    Find scouting counties across Ireland
                </p>

                {counties.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No counties found. Please add counties via the admin dashboard.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {counties.map((county) => (
                            <Link key={county.id} href={`/counties/${county.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            {county.logo_url && (
                                                <img
                                                    src={county.logo_url}
                                                    alt={`${county.name} logo`}
                                                    className="w-16 h-16 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <CardTitle>{county.name}</CardTitle>
                                                {county.description && (
                                                    <CardDescription className="line-clamp-2">
                                                        {county.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {(county.email || county.website) && (
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                {county.email && <p>Email: {county.email}</p>}
                                                {county.website && <p>Website: {county.website}</p>}
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
