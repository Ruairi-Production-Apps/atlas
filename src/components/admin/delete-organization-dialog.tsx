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

interface DeleteOrganizationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    organizationName: string
    organizationType: 'province' | 'county' | 'group' | 'team'
    onConfirm: () => void
    loading?: boolean
}

export function DeleteOrganizationDialog({
    open,
    onOpenChange,
    organizationName,
    organizationType,
    onConfirm,
    loading = false,
}: DeleteOrganizationDialogProps) {
    const handleConfirm = () => {
        onConfirm()
    }

    const typeLabel = organizationType === 'province' ? 'Province' : organizationType === 'county' ? 'County' : organizationType === 'group' ? 'Group' : 'Team'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete {typeLabel}
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{organizationName}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>This action will:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Soft delete this {organizationType.toLowerCase()}</li>
                            {organizationType === 'province' && (
                                <li>Orphan all counties and groups under this province</li>
                            )}
                            {organizationType === 'county' && (
                                <li>Orphan all groups under this county</li>
                            )}
                            <li>Soft delete all news posts and events associated with this organization</li>
                        </ul>
                        <p className="mt-4 font-medium text-foreground">
                            This action cannot be undone.
                        </p>
                    </div>
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
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

