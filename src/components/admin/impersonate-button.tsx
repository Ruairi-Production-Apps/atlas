"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

interface ImpersonateButtonProps {
    userId: string
}

export function ImpersonateButton({ userId }: ImpersonateButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleImpersonate = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ target_user_id: userId }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to start impersonation')
            }

            // Redirect to Scouter Dashboard
            router.push('/scouter/dashboard')
            router.refresh()
        } catch (error: any) {
            alert(error.message || 'Failed to impersonate user')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={handleImpersonate}
            disabled={loading}
        >
            <LogIn className="h-4 w-4 mr-1" />
            {loading ? 'Loading...' : 'Log in as'}
        </Button>
    )
}

