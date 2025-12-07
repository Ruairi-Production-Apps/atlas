'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export function DeleteSuccessMessage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const deleted = searchParams.get('deleted')
        const name = searchParams.get('name')

        if (deleted && name) {
            const decodedName = decodeURIComponent(name)
            let typeLabel = ''
            if (deleted === 'province') {
                typeLabel = 'Province'
            } else if (deleted === 'county') {
                typeLabel = 'County'
            } else if (deleted === 'group') {
                typeLabel = 'Group'
            }

            setMessage(`${typeLabel} ${decodedName} deleted successfully!`)
            setOpen(true)

            // Auto-close after 3 seconds
            const timer = setTimeout(() => {
                setOpen(false)
                // Remove query params from URL
                router.replace('/admin/organizations')
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [searchParams, router])

    const handleClose = () => {
        setOpen(false)
        // Remove query params from URL
        router.replace('/admin/organizations')
    }

    if (!message) return null

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Success
                    </DialogTitle>
                    <DialogDescription>
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleClose}>
                        OK
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

