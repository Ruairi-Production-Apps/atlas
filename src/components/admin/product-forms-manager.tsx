'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Eye, EyeOff, Users, Settings } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'

interface ProductForm {
    id: string
    product_id: string
    title: string
    description: string | null
    form_type: 'interest' | 'booking' | 'custom'
    published: boolean
    created_at: string
    updated_at: string

    // Capacity
    capacity_mode: 'unlimited' | 'total' | 'per_type' | null
    capacity_total: number | null
    capacity_scouters: number | null
    capacity_youth: number | null

    // Pricing
    pricing_mode: 'product_default' | 'per_youth' | 'per_scouter' | 'per_person' | 'custom' | null
    price_base: number | null
    price_per_youth: number | null
    price_per_scouter: number | null
}

interface ProductFormsManagerProps {
    productId: string
    organizationType: string
    organizationId: string
    isSysadmin?: boolean
}

export function ProductFormsManager({
    productId,
    organizationType,
    organizationId,
    isSysadmin = false,
}: ProductFormsManagerProps) {
    const [forms, setForms] = useState<ProductForm[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [editingForm, setEditingForm] = useState<ProductForm | null>(null)
    const [formTitle, setFormTitle] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formType, setFormType] = useState<'interest' | 'booking' | 'custom'>('booking')

    useEffect(() => {
        loadForms()
    }, [productId])

    const loadForms = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/products/${productId}/forms`
            )
            if (!response.ok) throw new Error('Failed to load forms')
            const data = await response.json()
            setForms(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddForm = () => {
        setEditingForm(null)
        setFormTitle('')
        setFormDescription('')
        setFormType('booking')
        setFormDialogOpen(true)
    }

    const handleEditForm = (form: ProductForm) => {
        setEditingForm(form)
        setFormTitle(form.title)
        setFormDescription(form.description || '')
        setFormType(form.form_type)
        setFormDialogOpen(true)
    }

    const handleSaveForm = async () => {
        if (!formTitle.trim()) {
            setError('Form title is required')
            return
        }

        try {
            if (editingForm) {
                // Update existing form
                const response = await fetch(
                    `/api/organizations/${organizationType}/${organizationId}/products/${productId}/forms/${editingForm.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: formTitle,
                            description: formDescription
                        }),
                    }
                )
                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'Failed to update form')
                }
            } else {
                // Create new form
                const response = await fetch(
                    `/api/organizations/${organizationType}/${organizationId}/products/${productId}/forms`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            form_type: formType,
                            title: formTitle,
                            description: formDescription
                        }),
                    }
                )
                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'Failed to create form')
                }
            }
            setFormDialogOpen(false)
            await loadForms()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleTogglePublished = async (form: ProductForm) => {
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/products/${productId}/forms/${form.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ published: !form.published }),
                }
            )
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update form')
            }
            await loadForms()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleDeleteForm = async (form: ProductForm) => {
        if (!confirm(`Are you sure you want to delete "${form.title}"? This will also delete all form fields and submissions.`)) {
            return
        }

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/products/${productId}/forms/${form.id}`,
                {
                    method: 'DELETE',
                }
            )
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete form')
            }
            await loadForms()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const getFormTypeLabel = (type: string) => {
        switch (type) {
            case 'interest':
                return 'Expression of Interest'
            case 'booking':
                return 'Booking'
            case 'custom':
                return 'Custom'
            default:
                return type
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">Product Forms</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create booking forms, expression of interest forms, and more for this product.
                    </p>
                </div>
                <Button onClick={handleAddForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Form
                </Button>
            </div>

            {forms.length === 0 ? (
                <div className="border border-dashed rounded-lg py-12 text-center">
                    <p className="text-muted-foreground mb-4">No forms yet. Create your first form!</p>
                    <Button onClick={handleAddForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Form
                    </Button>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {forms.map((form) => (
                                <TableRow key={form.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{form.title}</div>
                                            {form.description && (
                                                <div className="text-sm text-muted-foreground line-clamp-1">
                                                    {form.description}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {getFormTypeLabel(form.form_type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={form.published ? 'default' : 'outline'}>
                                            {form.published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleTogglePublished(form)}
                                                className={form.published ? "text-green-600" : "text-muted-foreground"}
                                            >
                                                {form.published ? (
                                                    <>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Published
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="h-4 w-4 mr-1" />
                                                        Draft
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={
                                                    isSysadmin
                                                        ? `/admin/organizations/${organizationType}/${organizationId}/products/${productId}/forms/${form.id}/builder`
                                                        : `/scouter/organizations/${organizationId}/products/${productId}/forms/${form.id}/builder?type=${organizationType}`
                                                }>
                                                    <Settings className="h-4 w-4 mr-1" />
                                                    Build
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={
                                                    isSysadmin
                                                        ? `/admin/organizations/${organizationType}/${organizationId}/products/${productId}/forms/${form.id}/submissions`
                                                        : `/scouter/organizations/${organizationId}/products/${productId}/forms/${form.id}/submissions`
                                                }>
                                                    <Users className="h-4 w-4 mr-1" />
                                                    Submissions
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditForm(form)}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteForm(form)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingForm ? 'Edit Form' : 'Create New Form'}</DialogTitle>
                        <DialogDescription>
                            {editingForm
                                ? 'Update the form details below.'
                                : 'Create a new form for this product. You can add fields after creation.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="form-title">Form Title</Label>
                            <Input
                                id="form-title"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="e.g., Knife Skills Course Booking"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="form-description">Description (Optional)</Label>
                            <Textarea
                                id="form-description"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                placeholder="Brief description of this form"
                                rows={3}
                            />
                        </div>
                        {!editingForm && (
                            <div className="space-y-2">
                                <Label htmlFor="form-type">Form Type</Label>
                                <select
                                    id="form-type"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    value={formType}
                                    onChange={(e) => setFormType(e.target.value as 'interest' | 'booking' | 'custom')}
                                >
                                    <option value="booking">Booking (with payment)</option>
                                    <option value="interest">Expression of Interest</option>
                                    <option value="custom">Custom</option>
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    {formType === 'booking' && 'Allows payment and participant tracking'}
                                    {formType === 'interest' && 'Simple form to gauge interest without commitment'}
                                    {formType === 'custom' && 'Custom form type for other purposes'}
                                </p>
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveForm}>
                                {editingForm ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
