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

interface DeleteEventDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    eventTitle: string
    onConfirm: () => void
    loading?: boolean
}

export function DeleteEventDialog({
    open,
    onOpenChange,
    eventTitle,
    onConfirm,
    loading = false,
}: DeleteEventDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Event
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{eventTitle}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        This action will soft delete the event. It will no longer be visible to users.
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
