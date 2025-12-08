import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProvinceBySlug, getCountyBySlug, getGroupBySlug, getProvinces, getCounties } from "@/lib/supabase/queries"
import { OrganizationEditTabs } from "@/components/admin/organization-edit-tabs"
import { CreateSuccessModal } from "@/components/admin/create-success-modal"
import { Suspense } from "react"

export default async function EditOrganizationPage({
    params,
}: {
    params: Promise<{ type: string; id: string }>
}) {
    const { type, id } = await params
    const supabase = await createClient()

    // Check if user is sysadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Check permissions
    const { data: sysadminRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    const isSysadmin = !!sysadminRole

    if (!isSysadmin) {
        // If not sysadmin, check for specific org role
        const { data: orgRole } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('scope_type', type)
            .eq('scope_id', id)
            .single()

        if (!orgRole) {
            redirect('/')
        }
    }

    let organization = null
    let provinces: any[] = []
    let counties: any[] = []

    if (type === 'province') {
        // For provinces, we need to get by ID (not slug)
        const { data } = await supabase
            .from('provinces')
            .select('*')
            .eq('id', id)
            .single()
        organization = data
    } else if (type === 'county') {
        const { data } = await supabase
            .from('counties')
            .select('*')
            .eq('id', id)
            .single()
        organization = data
        provinces = await getProvinces()
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
    }

    else if (type === 'team') {
        const { data } = await supabase
            .from('adventure_teams')
            .select('*')
            .eq('id', id)
            .single()
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
            <h1 className="text-3xl font-bold mb-6">
                Manage {typeDisplay}
            </h1>
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
                allowDelete={isSysadmin}
                isSysadmin={isSysadmin}
            />
        </div>
    )
}

