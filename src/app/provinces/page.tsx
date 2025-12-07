import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProvinces } from "@/lib/supabase/queries"

export default async function ProvincesPage() {
    const provinces = await getProvinces()

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">Provinces</h1>
                <p className="text-lg text-muted-foreground mb-12">
                    Explore scouting provinces across Ireland
                </p>

                {provinces.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No provinces found. Please add provinces via the admin dashboard.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {provinces.map((province) => (
                            <Link key={province.id} href={`/provinces/${province.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            {province.logo_url && (
                                                <img
                                                    src={province.logo_url}
                                                    alt={`${province.name} logo`}
                                                    className="w-16 h-16 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <CardTitle>{province.name}</CardTitle>
                                                {province.description && (
                                                    <CardDescription className="line-clamp-2">
                                                        {province.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {(province.email || province.website) && (
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                {province.email && <p>Email: {province.email}</p>}
                                                {province.website && <p>Website: {province.website}</p>}
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
