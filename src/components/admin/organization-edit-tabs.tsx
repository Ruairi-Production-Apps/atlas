'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditOrganizationForm } from './edit-organization-form'
import { OrganizationUsersTab } from './organization-users-tab'
import { OrganizationNewsTab } from './organization-news-tab'
import { OrganizationEventsTab } from './organization-events-tab'
import { OrganizationFinancialTab } from './organization-financial-tab'
import { StoreManager } from '@/components/scouter/store-manager'
import { Settings, Users, Newspaper, Calendar, CreditCard, ShoppingBag } from 'lucide-react'
import * as React from 'react'

interface OrganizationEditTabsProps {
    organization: any
    type: 'province' | 'county' | 'group'
    provinces?: Array<{ id: string; name: string }>
    counties?: Array<{ id: string; name: string }>
    allowDelete?: boolean
    isSysadmin?: boolean
}

export function OrganizationEditTabs({
    organization,
    type,
    provinces = [],
    counties = [],
    allowDelete = true,
    isSysadmin = false,
}: OrganizationEditTabsProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="details" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Details
                </TabsTrigger>
                <TabsTrigger value="users" className="cursor-pointer">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                </TabsTrigger>
                <TabsTrigger value="news" className="cursor-pointer">
                    <Newspaper className="h-4 w-4 mr-2" />
                    News
                </TabsTrigger>
                <TabsTrigger value="events" className="cursor-pointer">
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                </TabsTrigger>
                <TabsTrigger value="financial" className="cursor-pointer">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Financial
                </TabsTrigger>
                <TabsTrigger value="store" className="cursor-pointer">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Store
                </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
                <EditOrganizationForm
                    organization={organization}
                    type={type}
                    provinces={provinces}
                    counties={counties}
                    allowDelete={allowDelete}
                />
            </TabsContent>

            <TabsContent value="users" className="mt-6">
                <OrganizationUsersTab
                    organizationId={organization.id}
                    organizationType={type}
                    organizationName={organization.name}
                />
            </TabsContent>

            <TabsContent value="news" className="mt-6">
                <OrganizationNewsTab
                    organizationId={organization.id}
                    organizationType={type}
                    organizationName={organization.name}
                />
            </TabsContent>

            <TabsContent value="events" className="mt-6">
                <OrganizationEventsTab
                    organizationId={organization.id}
                    organizationType={type}
                    organizationName={organization.name}
                    isSysadmin={isSysadmin}
                />
            </TabsContent>

            <TabsContent value="financial" className="mt-6">
                <OrganizationFinancialTab
                    organizationId={organization.id}
                    organizationType={type}
                    organizationName={organization.name}
                />
            </TabsContent>

            <TabsContent value="store" className="mt-6">
                <StoreManager
                    scopeType={type}
                    scopeId={organization.id}
                />
            </TabsContent>
        </Tabs>
    )
}

