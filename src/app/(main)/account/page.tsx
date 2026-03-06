import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountTabs } from '@/components/account/account-tabs'
import {
    getUserOrganizations,
    getUserSubmissions,
    getUserOrders
} from '@/lib/supabase/queries'

export default async function AccountPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch account data in parallel
    const [organizations, submissions, orders] = await Promise.all([
        getUserOrganizations(user.id),
        getUserSubmissions(user.id),
        getUserOrders(user.id),
    ])

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Account</h1>
                <p className="text-muted-foreground">
                    Manage your account details, organizations, events, and orders.
                </p>
            </div>

            <AccountTabs
                user={user}
                organizations={organizations}
                submissions={submissions}
                orders={orders}
            />
        </div>
    )
}
