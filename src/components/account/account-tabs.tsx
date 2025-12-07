'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User } from '@supabase/supabase-js'
import { UserOrganization, UserSubmission, UserOrder } from '@/lib/supabase/queries'
import { ProfileForm } from './profile-form'
import { OrganizationsList } from './organizations-list'
import { EventsList } from './events-list'
import { OrdersList } from './orders-list'
import { UserCircle, Building2, CalendarDays, ShoppingBag } from 'lucide-react'

interface AccountTabsProps {
    user: User
    organizations: UserOrganization[]
    submissions: UserSubmission[]
    orders: UserOrder[]
}

export function AccountTabs({
    user,
    organizations,
    submissions,
    orders
}: AccountTabsProps) {
    return (
        <Tabs defaultValue="details" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                <TabsTrigger value="details">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Details
                </TabsTrigger>
                <TabsTrigger value="orgs">
                    <Building2 className="h-4 w-4 mr-2" />
                    My Orgs
                </TabsTrigger>
                <TabsTrigger value="events">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Events
                </TabsTrigger>
                <TabsTrigger value="shop">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Shop
                </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
                <div className="border rounded-lg p-6">
                    <ProfileForm user={user} />
                </div>
            </TabsContent>

            <TabsContent value="orgs">
                <OrganizationsList organizations={organizations} />
            </TabsContent>

            <TabsContent value="events">
                <EventsList submissions={submissions} />
            </TabsContent>

            <TabsContent value="shop">
                <OrdersList orders={orders} />
            </TabsContent>
        </Tabs>
    )
}
