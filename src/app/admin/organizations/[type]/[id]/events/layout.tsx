import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getUserPermissions } from '@/lib/auth/permissions'

export default async function EventsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ type: string; id: string }>
}) {
    const { type, id } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const permissions = await getUserPermissions(user.id, type, id)

    if (!permissions.events) {
        // Redirect to main organization dashboard without events access
        redirect(`/admin/organizations/${type}/${id}/edit`)
    }

    return <>{children}</>
}
