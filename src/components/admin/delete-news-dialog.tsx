'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface DeleteNewsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    newsTitle: string
    onConfirm: () => void
    loading?: boolean
}

export function DeleteNewsDialog({
    open,
    onOpenChange,
    newsTitle,
    onConfirm,
    loading = false,
}: DeleteNewsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete News Post
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{newsTitle}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        This action will soft delete the news post. It will no longer be visible to users.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
