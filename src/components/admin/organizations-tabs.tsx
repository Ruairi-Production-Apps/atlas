'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2 } from "lucide-react"
import { ReactNode } from 'react'

interface OrganizationsTabsProps {
    provincesCount: number
    countiesCount: number
    groupsCount: number
    provincesContent: ReactNode
    countiesContent: ReactNode
    groupsContent: ReactNode
}

export function OrganizationsTabs({
    provincesCount,
    countiesCount,
    groupsCount,
    provincesContent,
    countiesContent,
    groupsContent,
}: OrganizationsTabsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeTab = searchParams.get('tab') || 'provinces'

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', value)
        router.push(`?${params.toString()}`)
    }

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="provinces">
                    <Building2 className="h-4 w-4 mr-2" />
                    Provinces ({provincesCount})
                </TabsTrigger>
                <TabsTrigger value="counties">
                    Counties ({countiesCount})
                </TabsTrigger>
                <TabsTrigger value="groups">
                    Groups ({groupsCount})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="provinces" className="mt-6">
                {provincesContent}
            </TabsContent>

            <TabsContent value="counties" className="mt-6">
                {countiesContent}
            </TabsContent>

            <TabsContent value="groups" className="mt-6">
                {groupsContent}
            </TabsContent>
        </Tabs>
    )
}

