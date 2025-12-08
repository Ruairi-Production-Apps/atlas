import { createClient } from '@/lib/supabase/server'
import { getUserOrganizations } from '@/lib/supabase/queries'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, ArrowRight } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const organizations = await getUserOrganizations(user.id)

    return (
        <main className="container mx-auto px-4 py-10 max-w-5xl">
            <h1 className="text-3xl font-bold mb-2">My Organizations</h1>
            <p className="text-muted-foreground mb-8">Select an organization to manage.</p>

            {organizations.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Organizations Found</CardTitle>
                        <CardDescription>You are not a member of any organizations yet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Contact your administrator to be added to an organization.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {organizations.map((org) => (
                        <Card key={`${org.scope_type}-${org.scope_id}`} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{org.name}</CardTitle>
                                        <CardDescription className="capitalize">
                                            {org.scope_type} • {
                                                org.permissions?.is_section_lead
                                                    ? `${org.permissions.section_name || org.section_name || 'Section'} Lead`
                                                    : org.role === 'scouter' ? 'Scouter' : org.role.replace('_', ' ')
                                            }
                                        </CardDescription>
                                    </div>
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href={`/admin/organizations/${org.scope_type}/${org.scope_id}/edit`}>
                                        Go to {org.scope_type === 'province' ? 'Province' : org.scope_type === 'county' ? 'County' : 'Group'} Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    )
}
