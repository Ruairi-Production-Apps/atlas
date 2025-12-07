import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ImpersonationBar } from "@/components/admin/impersonation-bar"
import { getAdminOrganizations } from "@/lib/admin/queries"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Home, Building2 } from "lucide-react"
import { ModeToggle } from "@/components/theme-toggle"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Role checks are handled in individual pages
    // We just ensure the user is authenticated here (checked above)

    // Check for impersonation
    const cookieStore = await cookies()
    const impersonateUserId = cookieStore.get('impersonate_user_id')?.value
    const impersonateAdminId = cookieStore.get('impersonate_admin_id')?.value

    let impersonatedUser = null
    let adminUser = null
    let adminOrganizations: Array<{ type: 'province' | 'county' | 'group'; id: string; name: string }> = []

    if (impersonateUserId && impersonateAdminId) {
        // Get impersonated user
        const { data: impersonatedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', impersonateUserId)
            .single()

        // Get admin user
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', impersonateAdminId)
            .single()

        if (impersonatedProfile && adminProfile) {
            impersonatedUser = {
                id: impersonatedProfile.id,
                email: impersonatedProfile.email,
                full_name: impersonatedProfile.full_name,
            }
            adminUser = {
                id: adminProfile.id,
                email: adminProfile.email,
                full_name: adminProfile.full_name,
            }
            adminOrganizations = await getAdminOrganizations(impersonateAdminId)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {impersonatedUser && adminUser && (
                <ImpersonationBar
                    impersonatedUser={impersonatedUser}
                    adminUser={adminUser}
                    adminOrganizations={adminOrganizations}
                />
            )}
            <div className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/admin" className="text-xl font-bold cursor-pointer">
                                Admin Dashboard
                            </Link>
                            <nav className="hidden md:flex items-center gap-4">
                                <Link href="/admin/organizations" className="cursor-pointer">
                                    <Button variant="ghost" size="sm" className="cursor-pointer">
                                        <Building2 className="h-4 w-4 mr-2" />
                                        Organizations
                                    </Button>
                                </Link>
                                <Link href="/admin/users" className="cursor-pointer">
                                    <Button variant="ghost" size="sm" className="cursor-pointer">
                                        <Users className="h-4 w-4 mr-2" />
                                        Users
                                    </Button>
                                </Link>
                                <Link href="/admin/users/new" className="cursor-pointer">
                                    <Button variant="ghost" size="sm" className="cursor-pointer">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add User
                                    </Button>
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/" className="cursor-pointer">
                                <Button variant="ghost" size="sm" className="cursor-pointer">
                                    <Home className="h-4 w-4 mr-2" />
                                    Back to Site
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}

