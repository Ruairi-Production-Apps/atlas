import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProvinces, getCounties } from "@/lib/supabase/queries"
import { OrganizationEditTabs } from "@/components/admin/organization-edit-tabs"
import { CreateSuccessModal } from "@/components/admin/create-success-modal"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUserPermissions } from "@/lib/auth/permissions"

export default async function EditOrganizationPage({
    params,
}: {
    params: Promise<{ type: string; id: string }>
}) {
    const { type, id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const permissions = await getUserPermissions(user.id, type, id)

    if (!permissions) {
        redirect('/')
    }

    let organization = null
    let provinces: any[] = []
    let counties: any[] = []

    if (type === 'province') {
        const { data } = await supabase.from('provinces').select('*').eq('id', id).single()
        organization = data
    } else if (type === 'county') {
        const { data } = await supabase.from('counties').select('*').eq('id', id).single()
        organization = data
        provinces = await getProvinces()
    } else if (type === 'group') {
        const { data } = await supabase.from('groups').select('*').eq('id', id).single()
        organization = data
        provinces = await getProvinces()
        if (organization?.county_id) {
            const county = await supabase.from('counties').select('province_id').eq('id', organization.county_id).single()
            if (county.data?.province_id) {
                counties = await getCounties(county.data.province_id)
                organization.province_id = county.data.province_id
            }
        }
    } else if (type === 'team') {
        const { data } = await supabase.from('adventure_teams').select('*').eq('id', id).single()
        organization = data
    }

    if (!organization) {
        notFound()
    }

    const organizationType = (type === 'province' || type === 'county' || type === 'group' || type === 'team')
        ? type
        : 'province'
    const typeDisplay = organizationType.charAt(0).toUpperCase() + organizationType.slice(1)

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Manage {typeDisplay}
                </h1>
                <Link href="/admin/organizations">
                    <Button variant="outline">
                        Back to Organizations
                    </Button>
                </Link>
            </div>
            <Suspense fallback={null}>
                <CreateSuccessModal
                    organizationName={organization.name}
                    organizationType={organizationType}
                />
            </Suspense>
            <OrganizationEditTabs
                organization={organization}
                type={organizationType}
                provinces={provinces}
                counties={counties}
                allowDelete={permissions.admin}
                isSysadmin={permissions.admin} // Treating admin permission as equivalent for UI purposes here
                permissions={permissions}
            />
        </div>
    )
}

