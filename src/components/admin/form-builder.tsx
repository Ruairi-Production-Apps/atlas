'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GripVertical, Plus, Trash2, Edit, Type, FileText, List, CheckSquare, Radio, Users, Building } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface FormField {
    id: string
    form_id: string
    field_type: 'short_text' | 'long_text' | 'select' | 'multi_select' | 'radio' | 'group' | 'participants'
    label: string
    required: boolean
    display_order: number
    options?: any
    participants_config?: any
}

interface FormBuilderProps {
    formId: string
    formTitle: string
    eventId: string
    organizationType: string
    organizationId: string
    formButtonText: string
}

const FIELD_TYPES = [
    { type: 'short_text', label: 'Short Text', icon: Type },
    { type: 'long_text', label: 'Long Text', icon: FileText },
    { type: 'select', label: 'Select', icon: List },
    { type: 'multi_select', label: 'Multi-Select', icon: CheckSquare },
    { type: 'radio', label: 'Radio', icon: Radio },
    { type: 'group', label: 'Group', icon: Building },
    { type: 'participants', label: 'Participants', icon: Users },
] as const

function SortableFieldItem({ field, onEdit, onDelete }: { field: FormField; onEdit: () => void; onDelete: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const fieldTypeInfo = FIELD_TYPES.find(ft => ft.type === field.field_type)

    return (
        <div ref={setNodeRef} style={style} className="mb-2">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                        >
                            <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                {fieldTypeInfo && <fieldTypeInfo.icon className="h-4 w-4 text-muted-foreground" />}
                                <span className="font-medium">{field.label}</span>
                                {field.required && (
                                    <span className="text-xs text-muted-foreground">(Required)</span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    ({fieldTypeInfo?.label || field.field_type})
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={onEdit}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export function FormBuilder({
    formId,
    formTitle,
    eventId,
    organizationType,
    organizationId,
    formButtonText,
}: FormBuilderProps) {
    const [fields, setFields] = useState<FormField[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [fieldDialogOpen, setFieldDialogOpen] = useState(false)
    const [editingField, setEditingField] = useState<FormField | null>(null)
    const [selectedFieldType, setSelectedFieldType] = useState<string>('short_text')

    // Form settings state
    const [formTitleState, setFormTitleState] = useState(formTitle)
    const [formButtonTextState, setFormButtonTextState] = useState(formButtonText)
    const [savingSettings, setSavingSettings] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        loadFields()
    }, [formId])

    const loadFields = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}/fields`
            )
            if (!response.ok) throw new Error('Failed to load fields')
            const data = await response.json()
            setFields(data.fields || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const saveFormSettings = async () => {
        setSavingSettings(true)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formTitleState,
                        button_text: formButtonTextState,
                    }),
                }
            )

            if (!response.ok) throw new Error('Failed to save settings')
            // Show success feedback if needed (optional)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSavingSettings(false)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex(f => f.id === active.id)
            const newIndex = fields.findIndex(f => f.id === over.id)

            const newFields = arrayMove(fields, oldIndex, newIndex)
            setFields(newFields)

            // Update order in database
            try {
                const field_orders = newFields.map((field, index) => ({
                    id: field.id,
                    display_order: index,
                }))

                const response = await fetch(
                    `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}/fields`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ field_orders }),
                    }
                )

                if (!response.ok) {
                    // Revert on error
                    await loadFields()
                    throw new Error('Failed to update field order')
                }
            } catch (err: any) {
                setError(err.message)
                await loadFields() // Revert to original order
            }
        }
    }

    const handleAddField = (fieldType: string) => {
        setSelectedFieldType(fieldType)
        setEditingField(null)
        setFieldDialogOpen(true)
    }

    const handleEditField = (field: FormField) => {
        setEditingField(field)
        setSelectedFieldType(field.field_type)
        setFieldDialogOpen(true)
    }

    const handleDeleteField = async (fieldId: string) => {
        if (!confirm('Are you sure you want to delete this field?')) {
            return
        }

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}/fields/${fieldId}`,
                {
                    method: 'DELETE',
                }
            )
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete field')
            }
            await loadFields()
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {error && (
                <div className="col-span-full p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Form Settings */}
            <div className="col-span-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Form Settings</CardTitle>
                        <CardDescription>Configure the main settings for this form</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4 items-end">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="form-title">Form Title</Label>
                            <Input
                                id="form-title"
                                value={formTitleState}
                                onChange={(e) => setFormTitleState(e.target.value)}
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="button-text">Open Button Text</Label>
                            <Input
                                id="button-text"
                                value={formButtonTextState}
                                onChange={(e) => setFormButtonTextState(e.target.value)}
                                placeholder="e.g. Register Now"
                            />
                        </div>
                        <Button onClick={saveFormSettings} disabled={savingSettings}>
                            {savingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar - Field Types */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Field</CardTitle>
                        <CardDescription>Drag or click to add fields to your form</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {FIELD_TYPES.map((fieldType) => {
                            const Icon = fieldType.icon
                            return (
                                <Button
                                    key={fieldType.type}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleAddField(fieldType.type)}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {fieldType.label}
                                </Button>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Main Area - Form Fields */}
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Form Fields</CardTitle>
                        <CardDescription>Drag to reorder fields</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {fields.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No fields yet. Add a field from the sidebar to get started.</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={fields.map(f => f.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {fields.map((field) => (
                                        <SortableFieldItem
                                            key={field.id}
                                            field={field}
                                            onEdit={() => handleEditField(field)}
                                            onDelete={() => handleDeleteField(field.id)}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Field Edit Dialog */}
            <FieldEditDialog
                open={fieldDialogOpen}
                onOpenChange={setFieldDialogOpen}
                field={editingField}
                fieldType={selectedFieldType}
                formId={formId}
                eventId={eventId}
                organizationType={organizationType}
                organizationId={organizationId}
                onSuccess={loadFields}
            />
        </div>
    )
}

// Field Edit Dialog Component
function FieldEditDialog({
    open,
    onOpenChange,
    field,
    fieldType,
    formId,
    eventId,
    organizationType,
    organizationId,
    onSuccess,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    field: FormField | null
    fieldType: string
    formId: string
    eventId: string
    organizationType: string
    organizationId: string
    onSuccess: () => void
}) {
    const [label, setLabel] = useState('')
    const [required, setRequired] = useState(false)
    const [options, setOptions] = useState<string[]>([''])
    const [saving, setSaving] = useState(false)

    // Participants field configuration
    const [participantTypes, setParticipantTypes] = useState<('scouter' | 'youth_member')[]>(['youth_member'])
    const [availableSections, setAvailableSections] = useState<Array<{ type: string; label: string }>>([])
    const [selectedSections, setSelectedSections] = useState<string[]>([])
    const [scouterFields, setScouterFields] = useState({
        first_name: true,
        last_name: true,
        email: false,
        phone: false,
        date_of_birth: false,
    })
    const [youthFields, setYouthFields] = useState({
        first_name: true,
        last_name: true,
        email: false,
        phone: false,
        date_of_birth: true,
    })

    useEffect(() => {
        if (field) {
            setLabel(field.label)
            setRequired(field.required)
            if (field.options && Array.isArray(field.options)) {
                setOptions(field.options.length > 0 ? field.options : [''])
            } else {
                setOptions([''])
            }

            // Load participants config if exists
            if (field.field_type === 'participants' && field.participants_config) {
                const config = field.participants_config as any
                if (config.participant_types) {
                    setParticipantTypes(config.participant_types)
                }
                if (config.selected_sections) {
                    setSelectedSections(config.selected_sections)
                }
                if (config.scouter_fields) {
                    setScouterFields(config.scouter_fields)
                }
                if (config.youth_fields) {
                    setYouthFields(config.youth_fields)
                }
            }
        } else {
            setLabel('')
            setRequired(false)
            setOptions([''])
            setParticipantTypes(['youth_member'])
            setSelectedSections([])
            setScouterFields({
                first_name: true,
                last_name: true,
                email: false,
                phone: false,
                date_of_birth: false,
            })
            setYouthFields({
                first_name: true,
                last_name: true,
                email: false,
                phone: false,
                date_of_birth: true,
            })
        }
    }, [field, open])

    // Load available sections when participants field is opened and eventId is available
    useEffect(() => {
        if (open && fieldType === 'participants' && eventId) {
            fetch(`/api/organizations/${organizationType}/${organizationId}/events/${eventId}/sections`)
                .then(res => res.json())
                .then(data => {
                    if (data.sections) {
                        setAvailableSections(data.sections)
                    }
                })
                .catch(err => console.error('Failed to load sections:', err))
        }
    }, [open, fieldType, eventId, organizationType, organizationId])

    const handleSave = async () => {
        if (!label.trim()) {
            return
        }

        setSaving(true)
        try {
            const payload: any = {
                label: label.trim(),
                required,
            }

            // Add options for select, multi_select, radio
            if (['select', 'multi_select', 'radio'].includes(fieldType)) {
                payload.options = options.filter(opt => opt.trim() !== '')
            }

            // Add participants_config for participants field
            if (fieldType === 'participants') {
                payload.participants_config = {
                    participant_types: participantTypes,
                    selected_sections: participantTypes.includes('youth_member') && participantTypes.includes('scouter')
                        ? selectedSections
                        : [],
                    scouter_fields: scouterFields,
                    youth_fields: youthFields,
                }
            }

            const url = field
                ? `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}/fields/${field.id}`
                : `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}/fields`

            const method = field ? 'PATCH' : 'POST'

            if (!field) {
                payload.field_type = fieldType
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to save field')
            }

            onOpenChange(false)
            onSuccess()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setSaving(false)
        }
    }

    const needsOptions = ['select', 'multi_select', 'radio'].includes(fieldType)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={fieldType === 'participants' ? 'max-w-4xl max-h-[90vh] overflow-y-auto' : 'max-w-2xl'}>
                <DialogHeader>
                    <DialogTitle>{field ? 'Edit Field' : 'Add Field'}</DialogTitle>
                    <DialogDescription>
                        {field ? 'Update the field properties' : `Configure the ${FIELD_TYPES.find(ft => ft.type === fieldType)?.label || fieldType} field`}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="field-label">Label *</Label>
                        <Input
                            id="field-label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Field label"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="field-required"
                            checked={required}
                            onCheckedChange={(checked) => setRequired(checked === true)}
                        />
                        <Label htmlFor="field-required" className="cursor-pointer">
                            Required field
                        </Label>
                    </div>

                    {needsOptions && (
                        <div className="space-y-2">
                            <Label>Options *</Label>
                            {options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={option}
                                        onChange={(e) => {
                                            const newOptions = [...options]
                                            newOptions[index] = e.target.value
                                            setOptions(newOptions)
                                        }}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    {options.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setOptions(options.filter((_, i) => i !== index))
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOptions([...options, ''])}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                            </Button>
                        </div>
                    )}

                    {fieldType === 'group' && (
                        <p className="text-sm text-muted-foreground mt-2">
                            Group field will show a dropdown of all Scouting Groups.
                        </p>
                    )}

                    {fieldType === 'participants' && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label>Participant Types</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="participant-scouter"
                                            checked={participantTypes.includes('scouter')}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setParticipantTypes([...participantTypes, 'scouter'])
                                                } else {
                                                    setParticipantTypes(participantTypes.filter(t => t !== 'scouter'))
                                                }
                                            }}
                                        />
                                        <Label htmlFor="participant-scouter" className="cursor-pointer">
                                            Allow Scouters
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="participant-youth"
                                            checked={participantTypes.includes('youth_member')}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setParticipantTypes([...participantTypes, 'youth_member'])
                                                } else {
                                                    setParticipantTypes(participantTypes.filter(t => t !== 'youth_member'))
                                                }
                                            }}
                                        />
                                        <Label htmlFor="participant-youth" className="cursor-pointer">
                                            Allow Youth Members
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {participantTypes.includes('youth_member') && participantTypes.includes('scouter') && availableSections.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Sections (for Youth Members)</Label>
                                    <div className="space-y-2">
                                        {availableSections.map((section) => (
                                            <div key={section.type} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`section-${section.type}`}
                                                    checked={selectedSections.includes(section.type)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedSections([...selectedSections, section.type])
                                                        } else {
                                                            setSelectedSections(selectedSections.filter(s => s !== section.type))
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`section-${section.type}`} className="cursor-pointer">
                                                    {section.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {participantTypes.includes('scouter') && (
                                <div className="space-y-2 border-t pt-4">
                                    <Label>Fields for Scouters</Label>
                                    <div className="space-y-2">
                                        {Object.entries(scouterFields).map(([key, value]) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`scouter-${key}`}
                                                    checked={value}
                                                    onCheckedChange={(checked) => {
                                                        setScouterFields(prev => ({ ...prev, [key]: checked === true }))
                                                    }}
                                                />
                                                <Label htmlFor={`scouter-${key}`} className="cursor-pointer capitalize">
                                                    {key.replace(/_/g, ' ')}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {participantTypes.includes('youth_member') && (
                                <div className="space-y-2 border-t pt-4">
                                    <Label>Fields for Youth Members</Label>
                                    <div className="space-y-2">
                                        {Object.entries(youthFields).map(([key, value]) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`youth-${key}`}
                                                    checked={value}
                                                    onCheckedChange={(checked) => {
                                                        setYouthFields(prev => ({ ...prev, [key]: checked === true }))
                                                    }}
                                                />
                                                <Label htmlFor={`youth-${key}`} className="cursor-pointer capitalize">
                                                    {key.replace(/_/g, ' ')}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !label.trim()}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {field ? 'Update' : 'Add'} Field
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

