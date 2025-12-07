"use client"

import { Button } from "@/components/ui/button"
import { X, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface ImpersonationBarProps {
  impersonatedUser: {
    id: string
    email: string
    full_name?: string | null
  }
  adminUser: {
    id: string
    email: string
    full_name?: string | null
  }
  adminOrganizations: Array<{
    type: 'province' | 'county' | 'group'
    id: string
    name: string
  }>
}

export function ImpersonationBar({
  impersonatedUser,
  adminUser,
  adminOrganizations,
}: ImpersonationBarProps) {
  const router = useRouter()

  const handleStopImpersonation = async () => {
    const response = await fetch('/api/admin/impersonate/stop', {
      method: 'POST',
    })
    if (response.ok) {
      router.refresh()
    }
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-yellow-500 text-yellow-900 border-b border-yellow-600 shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <User className="h-4 w-4" />
              <span className="font-semibold text-sm">Admin Mode:</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm truncate">
                Logged in as <strong>{impersonatedUser.full_name || impersonatedUser.email}</strong>
              </span>
              <span className="text-xs opacity-75">({impersonatedUser.email})</span>
            </div>
            {adminOrganizations.length > 0 && (
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="opacity-75">Admin of:</span>
                <div className="flex gap-1 flex-wrap">
                  {adminOrganizations.map((org) => (
                    <span
                      key={`${org.type}-${org.id}`}
                      className="px-2 py-0.5 bg-yellow-600/30 rounded text-xs"
                    >
                      {org.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleStopImpersonation}
            size="sm"
            variant="outline"
            className="bg-yellow-600/20 border-yellow-700 hover:bg-yellow-600/30 text-yellow-900 shrink-0"
          >
            <X className="h-4 w-4 mr-1" />
            Switch Back to {adminUser.full_name || adminUser.email}
          </Button>
        </div>
      </div>
    </div>
  )
}

