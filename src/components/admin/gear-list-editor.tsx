"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, Loader2, Save, RefreshCw, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GearListItem {
    id: string
    item_name: string
    quantity: number
    category: string | null
    notes: string | null
    display_order: number
}

interface GearList {
    id: string
    title: string
    description: string | null
    share_token: string
    published: boolean
    items?: GearListItem[]
}

interface GearListEditorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    gearList: GearList | null
    organizationId: string
    organizationType: string
    onSaved: () => void
}

const CATEGORIES = [
    'Clothing',
    'Camping Gear',
    'Safety & Tools',
    'Personal',
    'Food & Cooking',
    'Electronics',
    'Documents',
    'Other'
]

function SortableItem({ item, onUpdate, onDelete }: {
    item: GearListItem
    onUpdate: (item: GearListItem) => void
    onDelete: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} className="mb-2">
            <Card>
                <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-2"
                        >
                            <GripVertical className="h-5 w-5" />
                        </div>

                        <div className="flex-1 grid grid-cols-12 gap-2">
                            <div className="col-span-8">
                                <Input
                                    value={item.item_name}
                                    onChange={(e) => onUpdate({ ...item, item_name: e.target.value })}
                                    placeholder="Item name"
                                    className="h-8"
                                />
                            </div>
                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => onUpdate({ ...item, quantity: parseInt(e.target.value) || 1 })}
                                    className="h-8"
                                />
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(item.id)}
                                    className="h-8"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    {item.notes && (
                        <div className="mt-2 ml-7">
                            <Input
                                value={item.notes}
                                onChange={(e) => onUpdate({ ...item, notes: e.target.value })}
                                placeholder="Notes (optional)"
                                className="h-7 text-xs"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export function GearListEditor({
    open,
    onOpenChange,
    gearList,
    organizationId,
    organizationType,
    onSaved
}: GearListEditorProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [published, setPublished] = useState(true)
    const [shareToken, setShareToken] = useState("")
    const [items, setItems] = useState<GearListItem[]>([])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Load gear list data if editing
    useEffect(() => {
        if (open && gearList) {
            loadGearListData()
        } else if (open && !gearList) {
            // New gear list
            resetForm()
        }
    }, [open, gearList])

    const loadGearListData = async () => {
        if (!gearList) return

        setLoadingData(true)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/gear-lists/${gearList.id}`
            )
            const data = await response.json()

            if (response.ok) {
                const list = data.gearList
                setTitle(list.title)
                setDescription(list.description || "")
                setPublished(list.published)
                setShareToken(list.share_token)
                setItems(list.items || [])
            }
        } catch (error) {
            console.error('Load gear list error:', error)
        } finally {
            setLoadingData(false)
        }
    }

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setPublished(true)
        setShareToken("")
        setItems([])
    }

    const handleAddItem = () => {
        const newItem: GearListItem = {
            id: `temp-${Date.now()}`,
            item_name: "",
            quantity: 1,
            category: 'Other',
            notes: null,
            display_order: items.length
        }
        setItems([...items, newItem])
    }

    const handleUpdateItem = (updatedItem: GearListItem) => {
        setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
    }

    const handleDeleteItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id)
                const newIndex = items.findIndex(item => item.id === over.id)

                const reordered = arrayMove(items, oldIndex, newIndex)
                // Update display_order
                return reordered.map((item, index) => ({
                    ...item,
                    display_order: index
                }))
            })
        }
    }

    const handleRegenerateToken = async () => {
        if (!gearList) return

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/gear-lists/${gearList.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || ''
                    },
                    body: JSON.stringify({ regenerate_token: true })
                }
            )

            if (response.ok) {
                const data = await response.json()
                setShareToken(data.gearList.share_token)
                toast({
                    title: "Token regenerated",
                    description: "A new share link has been generated. Old links will no longer work."
                })
            }
        } catch (error) {
            console.error('Regenerate token error:', error)
            toast({
                title: "Error",
                description: "Failed to regenerate share link",
                variant: "destructive"
            })
        }
    }

    const handleCopyLink = () => {
        const shareUrl = `${window.location.origin}/gear-lists/${shareToken}`
        navigator.clipboard.writeText(shareUrl)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
        toast({
            title: "Link copied",
            description: "Share link copied to clipboard"
        })
    }

    const handleSave = async () => {
        if (!title.trim()) {
            toast({
                title: "Title required",
                description: "Please enter a title for the gear list",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            let listId = gearList?.id

            // Create or update gear list
            if (!gearList) {
                // Create new
                const response = await fetch(
                    `/api/organizations/${organizationType}/${organizationId}/gear-lists`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || ''
                        },
                        body: JSON.stringify({
                            title,
                            description,
                            published
                        })
                    }
                )

                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'Create failed')
                }
                const data = await response.json()
                listId = data.gearList.id
            } else {
                // Update existing
                const response = await fetch(
                    `/api/organizations/${organizationType}/${organizationId}/gear-lists/${listId}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || ''
                        },
                        body: JSON.stringify({
                            title,
                            description,
                            published
                        })
                    }
                )

                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'Update failed')
                }
            }

            // Save items
            if (listId) {
                // Delete old items and create new ones (simpler than update logic)
                const itemsToSave = items.filter(item => item.item_name.trim())

                // We'll use the batch PATCH endpoint
                await fetch(
                    `/api/organizations/${organizationType}/${organizationId}/gear-lists/${listId}/items`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || ''
                        },
                        body: JSON.stringify({
                            items: itemsToSave.map((item, index) => ({
                                id: item.id.startsWith('temp-') ? undefined : item.id,
                                item_name: item.item_name,
                                quantity: item.quantity,
                                category: item.category,
                                notes: item.notes,
                                display_order: index
                            }))
                        })
                    }
                )
            }

            toast({
                title: gearList ? "Gear list updated" : "Gear list created",
                description: "The gear list has been saved successfully"
            })

            onSaved()

        } catch (error) {
            console.error('Save gear list error:', error)
            toast({
                title: "Error",
                description: "Failed to save gear list",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {gearList ? 'Edit Gear List' : 'Create Gear List'}
                    </DialogTitle>
                    <DialogDescription>
                        {gearList
                            ? 'Update your gear list details and items'
                            : 'Create a new packing list for events or camps'}
                    </DialogDescription>
                </DialogHeader>

                {loadingData ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Summer Camp 2024 Packing List"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add notes or instructions..."
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="published">Published</Label>
                                    <p className="text-xs text-muted-foreground">
                                        When published, this list can be shared publicly
                                    </p>
                                </div>
                                <Switch
                                    id="published"
                                    checked={published}
                                    onCheckedChange={setPublished}
                                />
                            </div>

                            {/* Share Link */}
                            {gearList && shareToken && (
                                <div className="p-4 bg-muted rounded-md space-y-2">
                                    <Label>Share Link</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            value={`${window.location.origin}/gear-lists/${shareToken}`}
                                            className="font-mono text-xs"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyLink}
                                        >
                                            {linkCopied ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRegenerateToken}
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items List */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label>Items</Label>
                                <Button variant="outline" size="sm" onClick={handleAddItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            {items.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-md">
                                    <p className="mb-2">No items yet</p>
                                    <Button variant="outline" size="sm" onClick={handleAddItem}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Item
                                    </Button>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={items.map(i => i.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2">
                                            {items.map((item) => (
                                                <SortableItem
                                                    key={item.id}
                                                    item={item}
                                                    onUpdate={handleUpdateItem}
                                                    onDelete={handleDeleteItem}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Gear List
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
