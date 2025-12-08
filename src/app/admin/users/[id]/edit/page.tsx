import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { EditUserForm } from "@/components/admin/edit-user-form"

export default async function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
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

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (!profile) {
        notFound()
    }

    // Get auth user data
    const adminClient = createAdminClient()
    const { data: authUser } = await adminClient.auth.admin.getUserById(id)

    if (!authUser?.user) {
        notFound()
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit User</h1>
            <EditUserForm
                userId={id}
                initialData={{
                    email: authUser.user.email || '',
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                }}
            />
        </div>
    )
}

