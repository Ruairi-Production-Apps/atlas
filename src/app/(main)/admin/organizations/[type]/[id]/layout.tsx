import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { getUserPermissions } from "@/lib/auth/permissions"

export default async function OrganizationAdminLayout({
    children,
    params,
}: {
    children: React.ReactNode
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
        // Not a member or admin
        // Check if sysadmin (getUserPermissions checks this inside actually? Yes it does)
        // If getUserPermissions returns null, they have NO role.
        redirect('/admin') // or 403
    }

    // Pass permissions down? Layouts can't pass props to children directly in Next.js easily
    // But we ensure they have AT LEAST some access.

    return (
        <>
            {children}
        </>
    )
}
