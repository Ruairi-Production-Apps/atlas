"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { User, LogOut, Shield, LayoutDashboard } from "lucide-react"
import Link from "next/link"

interface UserMenuProps {
    user: {
        id: string
        email?: string
        user_metadata?: {
            full_name?: string
            first_name?: string
            last_name?: string
        }
    }
    isAdmin?: boolean
}

export function UserMenu({ user, isAdmin = false }: UserMenuProps) {
    const router = useRouter()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const firstName = user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0]
    const lastName = user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ')
    const displayName = (firstName && lastName)
        ? `${firstName} ${lastName}`
        : (user.user_metadata?.full_name || user.email || "User")

    return (
        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="max-w-[150px] truncate">{displayName}</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/scouter/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Dashboard
                </Link>
            </Button>
            {isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin">
                        <Shield className="h-4 w-4 mr-1" />
                        Admin
                    </Link>
                </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
            </Button>
        </div>
    )
}

