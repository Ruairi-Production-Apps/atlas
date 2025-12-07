'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, FileText, Settings, Eye, EyeOff, Users } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface EventForm {
    id: string
    event_id: string
    form_type: 'expression_of_interest' | 'registration'
    title: string
    enabled: boolean
    created_at: string
    updated_at: string
}

interface EventFormsManagerProps {
    eventId: string
    organizationType: string
    organizationId: string
    isSysadmin?: boolean
}

export function EventFormsManager({
    eventId,
    organizationType,
    organizationId,
    isSysadmin = false,
}: EventFormsManagerProps) {
    const [forms, setForms] = useState<EventForm[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [editingForm, setEditingForm] = useState<EventForm | null>(null)
    const [formTitle, setFormTitle] = useState('')
    const [formType, setFormType] = useState<'expression_of_interest' | 'registration'>('registration')

    useEffect(() => {
        loadForms()
    }, [eventId])

    const loadForms = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms`
            )
            if (!response.ok) throw new Error('Failed to load forms')
            const data = await response.json()
            setForms(data.forms || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddForm = () => {
        setEditingForm(null)
        setFormTitle('')
        setFormType('registration')
        setFormDialogOpen(true)
    }

    const handleEditForm = (form: EventForm) => {
        setEditingForm(form)
        setFormTitle(form.title)
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
                    `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${editingForm.id}`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: formTitle }),
                    }
                )
                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'Failed to update form')
                }
            } else {
                // Create new form
                const response = await fetch(
                    `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ form_type: formType, title: formTitle }),
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

    const handleToggleEnabled = async (form: EventForm) => {
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${form.id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: !form.enabled }),
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

    const handleDeleteForm = async (form: EventForm) => {
        if (!confirm(`Are you sure you want to delete "${form.title}"? This will also delete all form fields and submissions.`)) {
            return
        }

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${form.id}`,
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
                <h2 className="text-2xl font-semibold">Event Forms</h2>
                <Button onClick={handleAddForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Form
                </Button>
            </div>

            {forms.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">No forms yet. Create your first form!</p>
                        <Button onClick={handleAddForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Form
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
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
                                        <TableCell className="font-medium">{form.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {form.form_type === 'registration' ? 'Registration' : 'Expression of Interest'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={form.enabled ? 'default' : 'outline'}>
                                                {form.enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleEnabled(form)}
                                                    className={form.enabled ? "text-green-600" : "text-muted-foreground"}
                                                    title={form.enabled ? "Unpublish Form" : "Publish Form"}
                                                >
                                                    {form.enabled ? (
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
                                                            ? `/admin/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${form.id}/builder`
                                                            : `/scouter/organizations/${organizationId}/events/${eventId}/forms/${form.id}/builder?type=${organizationType}`
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
                                                            ? `/admin/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${form.id}/submissions`
                                                            : `/scouter/organizations/${organizationId}/events/${eventId}/forms/${form.id}/submissions`
                                                    }>
                                                        <Users className="h-4 w-4 mr-1" />
                                                        Participants
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
                    </CardContent>
                </Card>
            )}

            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingForm ? 'Edit Form' : 'Create New Form'}</DialogTitle>
                        <DialogDescription>
                            {editingForm
                                ? 'Update the form details below.'
                                : 'Create a new form for this event. You can add fields after creation.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="form-title">Form Title</Label>
                            <Input
                                id="form-title"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="e.g., Event Registration Form"
                            />
                        </div>
                        {!editingForm && (
                            <div className="space-y-2">
                                <Label htmlFor="form-type">Form Type</Label>
                                <select
                                    id="form-type"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    value={formType}
                                    onChange={(e) => setFormType(e.target.value as 'expression_of_interest' | 'registration')}
                                >
                                    <option value="registration">Registration</option>
                                    <option value="expression_of_interest">Expression of Interest</option>
                                </select>
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

