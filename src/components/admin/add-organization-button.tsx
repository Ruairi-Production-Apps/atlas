'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function AddOrganizationButton() {
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'provinces'

    const getButtonText = () => {
        if (tab === 'provinces') return 'Add Province'
        if (tab === 'counties') return 'Add County'
        if (tab === 'groups') return 'Add Group'
        if (tab === 'teams') return 'Add Team'
        return 'Add Organization'
    }

    const getHref = () => {
        if (tab === 'provinces') return '/admin/organizations/new?type=province'
        if (tab === 'counties') return '/admin/organizations/new?type=county'
        if (tab === 'groups') return '/admin/organizations/new?type=group'
        if (tab === 'teams') return '/admin/organizations/new?type=team'
        return '/admin/organizations/new'
    }

    return (
        <Button asChild>
            <Link href={getHref()}>
                <Plus className="h-4 w-4 mr-2" />
                {getButtonText()}
            </Link>
        </Button>
    )
}

