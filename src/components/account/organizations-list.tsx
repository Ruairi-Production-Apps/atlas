'use client'

import { UserOrganization } from '@/lib/supabase/queries'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface OrganizationsListProps {
    organizations: UserOrganization[]
}

export function OrganizationsList({ organizations }: OrganizationsListProps) {
    if (organizations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
                <h3 className="text-lg font-semibold">No Organizations Found</h3>
                <p className="text-muted-foreground mt-2">
                    You are not a member of any organizations yet.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org, idx) => (
                <Card key={`${org.scope_type}-${org.scope_id}-${idx}`}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="line-clamp-1">{org.name}</CardTitle>
                            <Badge variant="outline" className="capitalize">
                                {org.scope_type}
                            </Badge>
                        </div>
                        <CardDescription>
                            Role: <span className="font-medium capitalize">
                                {org.permissions?.is_section_lead
                                    ? `${org.permissions.section_name || org.section_name || 'Section'} Lead`
                                    : org.role === 'scouter' ? 'Scouter' : org.role.replace('_', ' ')}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end">
                            <Button asChild variant="secondary" size="sm">
                                <Link href={`/scouter/${org.scope_type}s/${org.slug}`}>
                                    View Organization
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
