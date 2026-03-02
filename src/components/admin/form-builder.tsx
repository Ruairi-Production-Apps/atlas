'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GripVertical, Plus, Trash2, Edit, Type, FileText, List, CheckSquare, Radio, Users, Building, Mail, Phone as PhoneIcon, Hash, Calendar, Clock, Check, MapPin, Heading1, AlignLeft, Minus } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { FormBuilderSettings } from './form-builder-settings'
import { FormBuilderPayments } from './form-builder-payments'
import { FormBuilderConfirmations } from './form-builder-confirmations'

interface FormField {
    id: string
    form_id: string
    field_type: 'short_text' | 'long_text' | 'select' | 'multi_select' | 'radio' | 'group' | 'participants' | 'email' | 'phone' | 'number' | 'date' | 'datetime' | 'checkbox' | 'address' | 'heading' | 'paragraph' | 'section_break'
    label: string
    required: boolean
    display_order: number
    options?: any
    participants_config?: any
    validation_rules?: any
    number_config?: any
    date_config?: any
    address_config?: any
    content_config?: any
}

interface FormBuilderProps {
    formId: string
    formTitle: string
    formDescription?: string
    eventId: string // For products, this will be productId
    organizationType: string
    organizationId: string
    formButtonText: string
    isProductForm?: boolean // Flag to indicate if this is a product form
    isMembershipForm?: boolean // Flag to indicate if this is a membership form
}

const FIELD_TYPES = [
    { type: 'short_text', label: 'Short Text', icon: Type },
    { type: 'long_text', label: 'Long Text', icon: FileText },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'phone', label: 'Phone', icon: PhoneIcon },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'datetime', label: 'Date & Time', icon: Clock },
    { type: 'checkbox', label: 'Checkbox', icon: Check },
    { type: 'address', label: 'Address', icon: MapPin },
    { type: 'select', label: 'Select', icon: List },
    { type: 'multi_select', label: 'Multi-Select', icon: CheckSquare },
    { type: 'radio', label: 'Radio', icon: Radio },
    { type: 'group', label: 'Group', icon: Building },
    { type: 'participants', label: 'Participants', icon: Users },
    { type: 'heading', label: 'Heading', icon: Heading1 },
    { type: 'paragraph', label: 'Paragraph', icon: AlignLeft },
    { type: 'section_break', label: 'Section Break', icon: Minus },
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
    formDescription,
    eventId,
    organizationType,
    organizationId,
    formButtonText,
    isProductForm = false,
    isMembershipForm = false,
}: FormBuilderProps) {
    const [fields, setFields] = useState<FormField[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [fieldDialogOpen, setFieldDialogOpen] = useState(false)
    const [editingField, setEditingField] = useState<FormField | null>(null)
    const [selectedFieldType, setSelectedFieldType] = useState<string>('short_text')

    // Form settings state
    const [formTitleState, setFormTitleState] = useState(formTitle)
    const [formDescriptionState, setFormDescriptionState] = useState(formDescription || '')
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
            const basePath = isMembershipForm
                ? `/api/organizations/group/${organizationId}/membership/forms/${formId}`
                : isProductForm
                    ? `/api/organizations/${organizationType}/${organizationId}/products/${eventId}/forms/${formId}`
                    : `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}`

            const response = await fetch(`${basePath}/fields`)
            if (!response.ok) throw new Error('Failed to load fields')
            const data = await response.json()
            setFields(data.fields || data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const saveFormSettings = async () => {
        setSavingSettings(true)
        try {
            const basePath = isMembershipForm
                ? `/api/organizations/group/${organizationId}/membership/forms/${formId}`
                : isProductForm
                    ? `/api/organizations/${organizationType}/${organizationId}/products/${eventId}/forms/${formId}`
                    : `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}`

            const response = await fetch(
                basePath,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                    },
                    body: JSON.stringify({
                        title: formTitleState,
                        description: formDescriptionState,
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

                const basePath = isMembershipForm
                    ? `/api/organizations/group/${organizationId}/membership/forms/${formId}`
                    : isProductForm
                        ? `/api/organizations/${organizationType}/${organizationId}/products/${eventId}/forms/${formId}`
                        : `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}`

                const response = await fetch(
                    `${basePath}/fields`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                        },
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
            const basePath = isMembershipForm
                ? `/api/organizations/group/${organizationId}/membership/forms/${formId}`
                : isProductForm
                    ? `/api/organizations/${organizationType}/${organizationId}/products/${eventId}/forms/${formId}`
                    : `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}`

            const response = await fetch(
                `${basePath}/fields/${fieldId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                    },
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
        <Tabs defaultValue="fields" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="confirmations">Confirmations</TabsTrigger>
            </TabsList>

            {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Fields Tab */}
            <TabsContent value="fields" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
                <FormBuilderSettings
                    formId={formId}
                    eventId={eventId}
                    organizationType={organizationType}
                    organizationId={organizationId}
                    isProductForm={isProductForm}
                    initialSettings={{
                        title: formTitleState,
                        description: formDescriptionState,
                        button_text: formButtonTextState,
                        capacity_override: null,
                        visibility_override: null,
                        published: true
                    }}
                    onSettingsSaved={loadFields}
                />
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-6">
                <FormBuilderPayments
                    formId={formId}
                    eventId={eventId}
                    organizationType={organizationType}
                    organizationId={organizationId}
                    isProductForm={isProductForm}
                    onSettingsSaved={loadFields}
                />
            </TabsContent>

            {/* Confirmations Tab */}
            <TabsContent value="confirmations" className="mt-6">
                <FormBuilderConfirmations
                    formId={formId}
                    eventId={eventId}
                    organizationType={organizationType}
                    organizationId={organizationId}
                    isProductForm={isProductForm}
                    onSettingsSaved={loadFields}
                />
            </TabsContent>

            {/* Field Edit Dialog (shared across all tabs) */}
            <FieldEditDialog
                open={fieldDialogOpen}
                onOpenChange={setFieldDialogOpen}
                field={editingField}
                fieldType={selectedFieldType}
                formId={formId}
                eventId={eventId}
                organizationType={organizationType}
                organizationId={organizationId}
                isProductForm={isProductForm}
                isMembershipForm={isMembershipForm}
                onSuccess={loadFields}
            />
        </Tabs>
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
    isProductForm,
    isMembershipForm,
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
    isProductForm: boolean
    isMembershipForm?: boolean
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

    // Number field configuration
    const [numberMin, setNumberMin] = useState<string>('')
    const [numberMax, setNumberMax] = useState<string>('')
    const [numberStep, setNumberStep] = useState<string>('1')

    // Date field configuration
    const [includeTime, setIncludeTime] = useState(false)
    const [minDate, setMinDate] = useState<string>('')
    const [maxDate, setMaxDate] = useState<string>('')

    // Phone field configuration
    const [phoneFormat, setPhoneFormat] = useState<'irish' | 'international'>('irish')

    // Checkbox field configuration
    const [checkboxText, setCheckboxText] = useState('')

    // Address field configuration
    const [addressFields, setAddressFields] = useState({
        address1: { enabled: true, required: true, label: 'Address Line 1' },
        address2: { enabled: true, required: false, label: 'Address Line 2' },
        city: { enabled: true, required: true, label: 'City/Town' },
        county: { enabled: true, required: true, label: 'County' },
        eircode: { enabled: true, required: false, label: 'Eircode' },
    })

    // Content field configuration (heading, paragraph)
    const [headingLevel, setHeadingLevel] = useState<'h2' | 'h3' | 'h4'>('h2')
    const [headingText, setHeadingText] = useState('')
    const [paragraphText, setParagraphText] = useState('')

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

            // Load number config
            if (field.field_type === 'number' && field.number_config) {
                const config = field.number_config as any
                setNumberMin(config.min?.toString() || '')
                setNumberMax(config.max?.toString() || '')
                setNumberStep(config.step?.toString() || '1')
            }

            // Load date config
            if ((field.field_type === 'date' || field.field_type === 'datetime') && field.date_config) {
                const config = field.date_config as any
                setIncludeTime(field.field_type === 'datetime')
                setMinDate(config.min_date || '')
                setMaxDate(config.max_date || '')
            }

            // Load phone format
            if (field.field_type === 'phone' && field.validation_rules) {
                const rules = field.validation_rules as any
                setPhoneFormat(rules.format || 'irish')
            }

            // Load checkbox text
            if (field.field_type === 'checkbox') {
                setCheckboxText(field.label || '')
            }

            // Load address config
            if (field.field_type === 'address' && field.address_config) {
                setAddressFields(field.address_config as any)
            }

            // Load content config (heading, paragraph)
            if (field.content_config) {
                const config = field.content_config as any
                if (field.field_type === 'heading') {
                    setHeadingLevel(config.heading_level || 'h2')
                    setHeadingText(config.heading_text || field.label || '')
                }
                if (field.field_type === 'paragraph') {
                    setParagraphText(config.paragraph_text || '')
                }
            }
        } else {
            // Reset all fields for new field creation
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
            setNumberMin('')
            setNumberMax('')
            setNumberStep('1')
            setIncludeTime(fieldType === 'datetime')
            setMinDate('')
            setMaxDate('')
            setPhoneFormat('irish')
            setCheckboxText('')
            // Reset Phase 2 fields
            setAddressFields({
                address1: { enabled: true, required: true, label: 'Address Line 1' },
                address2: { enabled: true, required: false, label: 'Address Line 2' },
                city: { enabled: true, required: true, label: 'City/Town' },
                county: { enabled: true, required: true, label: 'County' },
                eircode: { enabled: true, required: false, label: 'Eircode' },
            })
            setHeadingLevel('h2')
            setHeadingText('')
            setParagraphText('')
        }
    }, [field, open, fieldType])

    // Load available sections when participants field is opened and eventId is available
    useEffect(() => {
        if (open && fieldType === 'participants' && eventId && !isProductForm && !isMembershipForm) {
            fetch(`/api/organizations/${organizationType}/${organizationId}/events/${eventId}/sections`)
                .then(res => res.json())
                .then(data => {
                    if (data.sections) {
                        setAvailableSections(data.sections)
                    }
                })
                .catch(err => console.error('Failed to load sections:', err))
        }
    }, [open, fieldType, eventId, organizationType, organizationId, isProductForm, isMembershipForm])

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

            // Add number_config for number field
            if (fieldType === 'number') {
                payload.number_config = {
                    min: numberMin ? parseFloat(numberMin) : null,
                    max: numberMax ? parseFloat(numberMax) : null,
                    step: numberStep ? parseFloat(numberStep) : 1,
                }
            }

            // Add date_config for date/datetime fields
            if (fieldType === 'date' || fieldType === 'datetime') {
                payload.date_config = {
                    min_date: minDate || null,
                    max_date: maxDate || null,
                    include_time: fieldType === 'datetime',
                }
            }

            // Add validation_rules for email and phone
            if (fieldType === 'email') {
                payload.validation_rules = {
                    type: 'email',
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                }
            }

            if (fieldType === 'phone') {
                payload.validation_rules = {
                    type: 'phone',
                    format: phoneFormat,
                    pattern: phoneFormat === 'irish'
                        ? '^(\\+353|0)[0-9]{8,9}$'
                        : '^\\+?[1-9]\\d{1,14}$', // E.164 international format
                }
            }

            // For checkbox, use custom label
            if (fieldType === 'checkbox' && checkboxText) {
                payload.label = checkboxText
            }

            // Add address_config for address field
            if (fieldType === 'address') {
                payload.address_config = addressFields
            }

            // Add content_config for content fields (heading, paragraph, section_break)
            if (fieldType === 'heading') {
                const config: any = {
                    heading_level: headingLevel,
                    heading_text: headingText,
                }
                payload.content_config = config
                // If heading text is provided but label is empty, fallback to heading text for the label
                if (!label.trim() && headingText) {
                    payload.label = headingText
                }
            }

            if (fieldType === 'paragraph') {
                payload.content_config = {
                    paragraph_text: paragraphText,
                }
                payload.required = false // Paragraphs are never required (content only)
            }

            if (fieldType === 'section_break') {
                payload.required = false // Section breaks are never required
            }

            const basePath = isMembershipForm
                ? `/api/organizations/group/${organizationId}/membership/forms/${formId}`
                : isProductForm
                    ? `/api/organizations/${organizationType}/${organizationId}/products/${eventId}/forms/${formId}`
                    : `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}`

            const url = field
                ? `${basePath}/fields/${field.id}`
                : `${basePath}/fields`

            const method = field ? 'PATCH' : 'POST'

            if (!field) {
                payload.field_type = fieldType
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
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

                    {!['heading', 'paragraph', 'section_break'].includes(fieldType) && (
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
                    )}

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

                    {/* Number field configuration */}
                    {fieldType === 'number' && (
                        <div className="space-y-3 border-t pt-4">
                            <Label>Number Configuration</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="number-min" className="text-xs">Minimum</Label>
                                    <Input
                                        id="number-min"
                                        type="number"
                                        value={numberMin}
                                        onChange={(e) => setNumberMin(e.target.value)}
                                        placeholder="No minimum"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="number-max" className="text-xs">Maximum</Label>
                                    <Input
                                        id="number-max"
                                        type="number"
                                        value={numberMax}
                                        onChange={(e) => setNumberMax(e.target.value)}
                                        placeholder="No maximum"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="number-step" className="text-xs">Step</Label>
                                    <Input
                                        id="number-step"
                                        type="number"
                                        value={numberStep}
                                        onChange={(e) => setNumberStep(e.target.value)}
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date/DateTime field configuration */}
                    {(fieldType === 'date' || fieldType === 'datetime') && (
                        <div className="space-y-3 border-t pt-4">
                            <Label>Date Configuration</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="min-date" className="text-xs">Minimum Date</Label>
                                    <Input
                                        id="min-date"
                                        type="date"
                                        value={minDate}
                                        onChange={(e) => setMinDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="max-date" className="text-xs">Maximum Date</Label>
                                    <Input
                                        id="max-date"
                                        type="date"
                                        value={maxDate}
                                        onChange={(e) => setMaxDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            {fieldType === 'datetime' && (
                                <p className="text-xs text-muted-foreground">
                                    This field will include time selection
                                </p>
                            )}
                        </div>
                    )}

                    {/* Phone field configuration */}
                    {fieldType === 'phone' && (
                        <div className="space-y-3 border-t pt-4">
                            <Label>Phone Configuration</Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="phone-irish"
                                        checked={phoneFormat === 'irish'}
                                        onChange={() => setPhoneFormat('irish')}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="phone-irish" className="cursor-pointer">
                                        Irish format (+353 or 0)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="phone-international"
                                        checked={phoneFormat === 'international'}
                                        onChange={() => setPhoneFormat('international')}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="phone-international" className="cursor-pointer">
                                        International format
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Checkbox field configuration */}
                    {fieldType === 'checkbox' && (
                        <div className="space-y-3 border-t pt-4">
                            <Label htmlFor="checkbox-text">Checkbox Text</Label>
                            <Input
                                id="checkbox-text"
                                value={checkboxText}
                                onChange={(e) => setCheckboxText(e.target.value)}
                                placeholder="e.g., I agree to the terms and conditions"
                            />
                            <p className="text-xs text-muted-foreground">
                                This text will appear next to the checkbox
                            </p>
                        </div>
                    )}

                    {/* Email field info */}
                    {fieldType === 'email' && (
                        <p className="text-sm text-muted-foreground border-t pt-4">
                            Email field includes automatic validation for valid email formats.
                        </p>
                    )}

                    {/* Address field configuration */}
                    {fieldType === 'address' && (
                        <div className="space-y-3 border-t pt-4">
                            <Label>Address Sub-Fields</Label>
                            <div className="space-y-2">
                                {Object.entries(addressFields).map(([key, config]) => (
                                    <div key={key} className="flex items-center justify-between space-x-2 p-2 border rounded">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`address-${key}-enabled`}
                                                checked={config.enabled}
                                                onCheckedChange={(checked) => {
                                                    setAddressFields({
                                                        ...addressFields,
                                                        [key]: { ...config, enabled: checked === true }
                                                    })
                                                }}
                                            />
                                            <Label htmlFor={`address-${key}-enabled`} className="font-normal cursor-pointer">
                                                {config.label}
                                            </Label>
                                        </div>
                                        {config.enabled && (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`address-${key}-required`}
                                                    checked={config.required}
                                                    onCheckedChange={(checked) => {
                                                        setAddressFields({
                                                            ...addressFields,
                                                            [key]: { ...config, required: checked === true }
                                                        })
                                                    }}
                                                />
                                                <Label htmlFor={`address-${key}-required`} className="text-xs cursor-pointer">
                                                    Required
                                                </Label>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Heading field configuration */}
                    {fieldType === 'heading' && (
                        <div className="space-y-3 border-t pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="heading-text">Heading Text *</Label>
                                <Input
                                    id="heading-text"
                                    value={headingText}
                                    onChange={(e) => setHeadingText(e.target.value)}
                                    placeholder="Enter heading text"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Heading Level</Label>
                                <div className="flex gap-2">
                                    {['h2', 'h3', 'h4'].map((level) => (
                                        <Button
                                            key={level}
                                            type="button"
                                            variant={headingLevel === level ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setHeadingLevel(level as 'h2' | 'h3' | 'h4')}
                                        >
                                            {level.toUpperCase()}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Headings help organize your form into sections
                            </p>
                        </div>
                    )}

                    {/* Paragraph field configuration */}
                    {fieldType === 'paragraph' && (
                        <div className="space-y-3 border-t pt-4">
                            <Label htmlFor="paragraph-text">Paragraph Text *</Label>
                            <Textarea
                                id="paragraph-text"
                                value={paragraphText}
                                onChange={(e) => setParagraphText(e.target.value)}
                                placeholder="Enter instructions or information for form users"
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                Use paragraphs to provide instructions or additional information
                            </p>
                        </div>
                    )}

                    {/* Section Break info */}
                    {fieldType === 'section_break' && (
                        <p className="text-sm text-muted-foreground border-t pt-4">
                            Section breaks add visual separation between form sections. No configuration needed.
                        </p>
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

