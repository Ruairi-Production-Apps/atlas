import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAllUsers } from "@/lib/admin/queries"
import { ManageOrganizationAdmins } from "@/components/admin/manage-organization-admins"

export default async function OrganizationAdminsPage({
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

    const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .single()

    if (!roles) {
        redirect('/')
    }

    // Get organization details
    let organization = null
    if (type === 'province') {
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
    } else if (type === 'group') {
        const { data } = await supabase
            .from('groups')
            .select('*')
            .eq('id', id)
            .single()
        organization = data
    }

    if (!organization) {
        notFound()
    }

    // Get all users
    const users = await getAllUsers()

    // Get current admins for this organization
    const { data: currentAdmins } = await supabase
        .from('user_roles')
        .select('*')
        .eq('scope_type', type)
        .eq('scope_id', id)

    const adminUserIds = currentAdmins?.map(a => a.user_id) || []

    const organizationType = (type === 'province' || type === 'county' || type === 'group') 
        ? type 
        : 'province'

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">
                Manage Admins: {organization.name}
            </h1>
            <p className="text-muted-foreground mb-6">
                Assign administrators to this {organizationType}
            </p>
            <ManageOrganizationAdmins
                organizationId={id}
                organizationName={organization.name}
                organizationType={organizationType}
                users={users}
                currentAdminIds={adminUserIds}
            />
        </div>
    )
}

