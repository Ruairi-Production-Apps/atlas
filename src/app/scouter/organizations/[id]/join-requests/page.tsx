import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GroupJoinRequests } from '@/components/groups/group-join-requests'

export default async function GroupJoinRequestsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ type?: string }>
}) {
    const { id } = await params
    const { type } = await searchParams

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify user has permission to manage this group
    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('scope_type', 'group')
        .eq('scope_id', id)
        .in('role', ['group_leader', 'sysadmin'])
        .single()

    if (!userRole) {
        redirect('/dashboard')
    }

    // Get group details
    const { data: group } = await supabase
        .from('groups')
        .select('name, slug')
        .eq('id', id)
        .single()

    if (!group) {
        redirect('/dashboard')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href={`/scouter/organizations/${id}/edit?type=group`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Group Management
                        </Link>
                    </Button>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">{group.name}</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage join requests for your group
                    </p>
                </div>

                <GroupJoinRequests groupId={id} groupName={group.name} />
            </div>
        </div>
    )
}
