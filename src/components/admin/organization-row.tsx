'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Edit, Users, Trash2 } from 'lucide-react'
import { DeleteOrganizationDialog } from './delete-organization-dialog'

interface OrganizationRowProps {
    id: string
    name: string
    type: 'province' | 'county' | 'group'
    description?: string | null
    email?: string | null
    website?: string | null
    provinceName?: string
    countyName?: string
}

export function OrganizationRow({
    id,
    name,
    type,
    description,
    email,
    website,
    provinceName,
    countyName,
}: OrganizationRowProps) {
    const router = useRouter()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const response = await fetch(`/api/admin/organizations/${type}/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                let errorMessage = 'Failed to delete organization'
                try {
                    const data = await response.json()
                    errorMessage = data.error || errorMessage
                } catch (jsonError) {
                    // If JSON parsing fails, try to get text
                    const text = await response.text()
                    errorMessage = text || errorMessage
                }
                throw new Error(errorMessage)
            }

            // Try to parse response, but don't fail if it's empty
            try {
                await response.json()
            } catch (jsonError) {
                // Response might be empty, that's okay
            }

            // Redirect with success message
            const typeParam = type === 'province' ? 'province' : type === 'county' ? 'county' : 'group'
            const tabName = type === 'province' ? 'provinces' : type === 'county' ? 'counties' : 'groups'
            router.push(`/admin/organizations?tab=${tabName}&deleted=${typeParam}&name=${encodeURIComponent(name)}`)
        } catch (error: any) {
            alert(error.message || 'Failed to delete organization')
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    return (
        <>
            <TableRow>
                <TableCell className="font-medium">{name}</TableCell>
                {type === 'county' && (
                    <TableCell>{provinceName || '-'}</TableCell>
                )}
                {type === 'group' && (
                    <>
                        <TableCell>{countyName || '-'}</TableCell>
                        <TableCell>{provinceName || '-'}</TableCell>
                    </>
                )}
                {(type === 'province' || type === 'county' || type === 'group') && (
                    <TableCell className="max-w-md truncate">
                        {description || '-'}
                    </TableCell>
                )}
                {(type === 'province' || type === 'county') && (
                    <TableCell>{email || '-'}</TableCell>
                )}
                {type === 'province' && (
                    <TableCell>
                        {website ? (
                            <a
                                href={website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                {website}
                            </a>
                        ) : (
                            '-'
                        )}
                    </TableCell>
                )}
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/organizations/${type}/${id}/admins`}>
                                <Users className="h-4 w-4 mr-1" />
                                Admins
                            </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/organizations/${type}/${id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteDialogOpen(true)}
                            className="cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
            <DeleteOrganizationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                organizationName={name}
                organizationType={type}
                onConfirm={handleDelete}
                loading={deleting}
            />
        </>
    )
}

