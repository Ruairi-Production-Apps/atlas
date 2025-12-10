'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DeleteNewsDialog } from './delete-news-dialog'
import { useToast } from '@/components/ui/use-toast'

interface DeleteNewsButtonProps {
    postId: string
    postTitle: string
    scopeType: string
    scopeId: string
}

export function DeleteNewsButton({
    postId,
    postTitle,
    scopeType,
    scopeId,
}: DeleteNewsButtonProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await fetch(
                `/api/organizations/${scopeType}/${scopeId}/news/${postId}`,
                {
                    method: 'DELETE',
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete news post')
            }

            toast({
                title: "News post deleted successfully",
                description: `${postTitle} has been removed.`,
            })
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast({
                title: "Error deleting news post",
                description: error.message || 'Failed to delete news post',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setOpen(true)}
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>

            <DeleteNewsDialog
                open={open}
                onOpenChange={setOpen}
                newsTitle={postTitle}
                onConfirm={handleDelete}
                loading={loading}
            />
        </>
    )
}
