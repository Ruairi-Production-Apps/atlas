import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProvinces, getCounties } from "@/lib/supabase/queries"
import { OrganizationEditTabs } from "@/components/admin/organization-edit-tabs"
import { getUserPermissions } from "@/lib/auth/permissions"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ScouterEditOrganizationPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ type?: string }>
}) {
    const { id } = await params
    const { type } = await searchParams
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    let organization = null
    let provinces: Array<{ id: string; name: string }> = []
    let counties: Array<{ id: string; name: string }> = []
    let isAdmin = false

    if (type === 'province') {
        const { data } = await supabase
            .from('provinces')
            .select('*')
            .eq('id', id)
            .single()
        organization = data

        // Check if user is provincial_admin for this province
        const { data: role } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'provincial_admin')
            .eq('scope_type', 'province')
            .eq('scope_id', id)
            .single()
        isAdmin = !!role
    } else if (type === 'county') {
        const { data } = await supabase
            .from('counties')
            .select('*')
            .eq('id', id)
            .single()
        organization = data
        provinces = await getProvinces()

        // Check if user is county_admin for this county
        const { data: role } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'county_admin')
            .eq('scope_type', 'county')
            .eq('scope_id', id)
            .single()
        isAdmin = !!role
    } else if (type === 'group') {
        const { data } = await supabase
            .from('groups')
            .select('*')
            .eq('id', id)
            .single()
        organization = data
        provinces = await getProvinces()
        if (organization?.county_id) {
            const county = await supabase
                .from('counties')
                .select('province_id')
                .eq('id', organization.county_id)
                .single()
            if (county.data?.province_id) {
                counties = await getCounties(county.data.province_id)
            }
        }

        // Check if user is group_leader for this group
        const { data: role } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'group_leader')
            .eq('scope_type', 'group')
            .eq('scope_id', id)
            .single()
        isAdmin = !!role
    }

    if (!organization) {
        notFound()
    }

    // Check granular permissions
    const permissions = await getUserPermissions(user.id, type || 'group', id)

    if (!permissions) {
        redirect('/scouter/dashboard')
    }

    const organizationType = (type === 'province' || type === 'county' || type === 'group')
        ? type
        : 'province'
    const typeDisplay = organizationType.charAt(0).toUpperCase() + organizationType.slice(1)

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Manage {typeDisplay}
                </h1>
                <Link href="/scouter/dashboard">
                    <Button variant="outline">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
            <OrganizationEditTabs
                organization={organization}
                type={organizationType}
                provinces={provinces}
                counties={counties}
                allowDelete={false}
                isSysadmin={false}
                permissions={permissions}
            />
        </div>
    )
}

