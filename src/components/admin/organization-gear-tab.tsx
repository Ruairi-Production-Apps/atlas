"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Copy, ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GearListEditor } from "./gear-list-editor"

interface GearList {
    id: string
    title: string
    description: string | null
    share_token: string
    published: boolean
    items_count: number
    created_at: string
}

interface OrganizationGearTabProps {
    organizationId: string
    organizationType: string
    organizationName: string
}

export function OrganizationGearTab({
    organizationId,
    organizationType,
    organizationName
}: OrganizationGearTabProps) {
    const { toast } = useToast()
    const [gearLists, setGearLists] = useState<GearList[]>([])
    const [loading, setLoading] = useState(true)
    const [editorOpen, setEditorOpen] = useState(false)
    const [editingList, setEditingList] = useState<GearList | null>(null)

    useEffect(() => {
        loadGearLists()
    }, [organizationId, organizationType])

    const loadGearLists = async () => {
        setLoading(true)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/gear-lists`
            )
            const data = await response.json()

            if (response.ok) {
                setGearLists(data.gearLists || [])
            }
        } catch (error) {
            console.error('Load gear lists error:', error)
            toast({
                title: "Error",
                description: "Failed to load gear lists",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingList(null)
        setEditorOpen(true)
    }

    const handleEdit = (list: GearList) => {
        setEditingList(list)
        setEditorOpen(true)
    }

    const handleDelete = async (listId: string) => {
        if (!confirm('Are you sure you want to delete this gear list? This cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/gear-lists/${listId}`,
                { method: 'DELETE' }
            )

            if (response.ok) {
                toast({
                    title: "Gear list deleted",
                    description: "The gear list has been deleted successfully."
                })
                loadGearLists()
            } else {
                throw new Error('Delete failed')
            }
        } catch (error) {
            console.error('Delete gear list error:', error)
            toast({
                title: "Error",
                description: "Failed to delete gear list",
                variant: "destructive"
            })
        }
    }

    const handleCopyShareLink = (token: string) => {
        const shareUrl = `${window.location.origin}/gear-lists/${token}`
        navigator.clipboard.writeText(shareUrl)
        toast({
            title: "Link copied",
            description: "Share link copied to clipboard"
        })
    }

    const handleSaved = () => {
        setEditorOpen(false)
        setEditingList(null)
        loadGearLists()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Gear Lists</CardTitle>
                            <CardDescription>
                                Create and manage packing lists for events and camps
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Gear List
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {gearLists.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="mb-4">No gear lists yet</p>
                            <Button onClick={handleCreate} variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Gear List
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gearLists.map((list) => (
                                    <TableRow key={list.id}>
                                        <TableCell className="font-medium">
                                            {list.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {list.items_count} items
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {list.published ? (
                                                <Badge variant="default">Published</Badge>
                                            ) : (
                                                <Badge variant="outline">Draft</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCopyShareLink(list.share_token)}
                                                    title="Copy share link"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a
                                                        href={`/gear-lists/${list.share_token}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Open in new tab"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(list)}
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(list.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Gear List Editor Dialog */}
            <GearListEditor
                open={editorOpen}
                onOpenChange={setEditorOpen}
                gearList={editingList}
                organizationId={organizationId}
                organizationType={organizationType}
                onSaved={handleSaved}
            />
        </div>
    )
}
