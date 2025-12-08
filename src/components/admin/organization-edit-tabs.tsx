'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditOrganizationForm } from './edit-organization-form'
import { OrganizationUsersTab } from './organization-users-tab'
import { OrganizationNewsTab } from './organization-news-tab'
import { OrganizationEventsTab } from './organization-events-tab'
import { OrganizationFinancialTab } from './organization-financial-tab'
import { StoreManager } from '@/components/scouter/store-manager'
import { OrganizationContactsManager } from './organization-contacts-manager'
import { Settings, Users, Newspaper, Calendar, CreditCard, ShoppingBag } from 'lucide-react'
import * as React from 'react'

interface OrganizationEditTabsProps {
    organization: any
    type: 'province' | 'county' | 'group' | 'team'
    provinces?: Array<{ id: string; name: string }>
    counties?: Array<{ id: string; name: string }>
    allowDelete?: boolean
    isSysadmin?: boolean
    permissions?: {
        org_details: boolean
        news: boolean
        events: boolean
        financial: boolean
        store: boolean
        admin: boolean
    }
}

export function OrganizationEditTabs({
    organization,
    type,
    provinces = [],
    counties = [],
    allowDelete = true,
    isSysadmin = false,
    permissions
}: OrganizationEditTabsProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    // Default to true permissions if not provided (fallback for existing usage elsewhere)
    // But in our case we always pass them now.
    const p = permissions || { org_details: true, news: true, events: true, financial: true, store: true, admin: true }

    // Determine default tab based on first available permission
    const defaultTab = p.org_details ? 'details' :
        p.news ? 'news' :
            p.events ? 'events' :
                p.financial ? 'financial' :
                    p.store ? 'store' : 'details'

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
                {p.org_details && (
                    <TabsTrigger value="details" className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Details
                    </TabsTrigger>
                )}

                {/* Only Admin can manage Users */}
                {p.admin && (
                    <TabsTrigger value="users" className="cursor-pointer">
                        <Users className="h-4 w-4 mr-2" />
                        Users
                    </TabsTrigger>
                )}

                {p.news && (
                    <TabsTrigger value="news" className="cursor-pointer">
                        <Newspaper className="h-4 w-4 mr-2" />
                        News
                    </TabsTrigger>
                )}

                {p.events && (
                    <TabsTrigger value="events" className="cursor-pointer">
                        <Calendar className="h-4 w-4 mr-2" />
                        Events
                    </TabsTrigger>
                )}

                {p.financial && (
                    <TabsTrigger value="financial" className="cursor-pointer">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Financial
                    </TabsTrigger>
                )}

                {p.store && (
                    <TabsTrigger value="store" className="cursor-pointer">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Store
                    </TabsTrigger>
                )}
            </TabsList>

            {p.org_details && (
                <TabsContent value="details" className="mt-6">
                    <EditOrganizationForm
                        organization={organization}
                        type={type}
                        provinces={provinces}
                        counties={counties}
                        allowDelete={allowDelete} // Passed from page based on admin perm
                    />
                    <OrganizationContactsManager
                        organizationId={organization.id}
                        organizationType={type}
                    />
                </TabsContent>
            )}

            {p.admin && (
                <TabsContent value="users" className="mt-6">
                    <OrganizationUsersTab
                        organizationId={organization.id}
                        organizationType={type}
                        organizationName={organization.name}
                    />
                </TabsContent>
            )}

            {p.news && (
                <TabsContent value="news" className="mt-6">
                    <OrganizationNewsTab
                        organizationId={organization.id}
                        organizationType={type}
                        organizationName={organization.name}
                    />
                </TabsContent>
            )}

            {p.events && (
                <TabsContent value="events" className="mt-6">
                    <OrganizationEventsTab
                        organizationId={organization.id}
                        organizationType={type}
                        organizationName={organization.name}
                        isSysadmin={isSysadmin}
                    />
                </TabsContent>
            )}

            {p.financial && (
                <TabsContent value="financial" className="mt-6">
                    <OrganizationFinancialTab
                        organizationId={organization.id}
                        organizationType={type}
                        organizationName={organization.name}
                    />
                </TabsContent>
            )}

            {p.store && (
                <TabsContent value="store" className="mt-6">
                    <StoreManager
                        scopeType={type}
                        scopeId={organization.id}
                    />
                </TabsContent>
            )}
        </Tabs>
    )
}

