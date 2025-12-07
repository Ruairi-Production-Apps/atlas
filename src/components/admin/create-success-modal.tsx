'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface CreateSuccessModalProps {
    organizationName: string
    organizationType: string
}

export function CreateSuccessModal({ organizationName, organizationType }: CreateSuccessModalProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const created = searchParams.get('created') === 'true'
        if (created) {
            setOpen(true)
            // Remove the 'created' parameter from URL after showing modal
            const timer = setTimeout(() => {
                setOpen(false)
                const params = new URLSearchParams(searchParams.toString())
                params.delete('created')
                const newUrl = params.toString() 
                    ? `${window.location.pathname}?${params.toString()}`
                    : window.location.pathname
                router.replace(newUrl)
            }, 3000) // Show for 3 seconds

            return () => clearTimeout(timer)
        }
    }, [router, searchParams])

    const typeDisplay = organizationType.charAt(0).toUpperCase() + organizationType.slice(1)

    if (!open) return null

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <DialogTitle>Success!</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        {typeDisplay} <strong>{organizationName}</strong> created successfully!
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

