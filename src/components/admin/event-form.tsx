'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { EventFeaturedImageUpload } from './event-featured-image-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { calculateStripeFee, calculateNetAmount, formatCurrency } from '@/lib/stripe-helpers'
import { SectionIcon } from '@/components/shared/section-icon'

interface Event {
    id: string
    title: string
    featured_image_url: string | null
    body: string | null
    tags: string[]
    start_date: string
    end_date: string | null
    location: string | null
    price: number | null
    capacity_groups: number | null
    capacity_scouters: number | null
    capacity_youth: number | null
    visibility: 'open_to_all' | 'sections_only' | 'scouters_only'
    pricing_mode: 'per_group' | 'per_scout' | 'per_person_type' | null
    price_scouter: number | null
    price_youth: number | null
    require_participant_info: boolean
    require_payment: boolean
    published: boolean
}

interface EventFormProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group'
    event?: Event | null
    onSuccess: () => void
    onCancel: () => void
}

export function EventForm({
    organizationId,
    organizationType,
    event,
    onSuccess,
    onCancel,
}: EventFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [tagInput, setTagInput] = useState('')
    const [selectedSections, setSelectedSections] = useState<string[]>([])
    const sectionTypes = ['beavers', 'cubs', 'scouts', 'ventures', 'rovers'] as const
    const [financialData, setFinancialData] = useState<{
        stripe_keys_validated: boolean
        has_bank_details: boolean
    }>({
        stripe_keys_validated: false,
        has_bank_details: false,
    })
    const [formData, setFormData] = useState({
        title: event?.title || '',
        featured_image_url: event?.featured_image_url || '',
        body: event?.body || '',
        tags: event?.tags || [],
        start_date: event?.start_date ? new Date(event.start_date).toISOString() : '',
        end_date: event?.end_date ? new Date(event.end_date).toISOString() : '',
        location: event?.location || '',
        price: event?.price?.toString() || '',
        capacity_groups: event?.capacity_groups?.toString() || '',
        capacity_scouters: event?.capacity_scouters?.toString() || '',
        capacity_youth: event?.capacity_youth?.toString() || '',
        visibility: event?.visibility || 'open_to_all',
        pricing_mode: event?.pricing_mode || 'per_scout',
        price_scouter: event?.price_scouter?.toString() || '',
        price_youth: event?.price_youth?.toString() || '',
        require_participant_info: event?.require_participant_info || false,
        require_payment: event?.require_payment || false,
        payment_method: (event as any)?.payment_method || '',
        published: event?.published ?? true,
    })

    // Fetch financial data on mount
    useEffect(() => {
        const fetchFinancialData = async () => {
            try {
                const response = await fetch(
                    `/api/organizations/${organizationType}/${organizationId}/financial`
                )
                if (response.ok) {
                    const data = await response.json()
                    setFinancialData({
                        stripe_keys_validated: data.stripe_keys_validated || false,
                        has_bank_details: !!(data.iban && data.bic && data.account_name),
                    })
                }
            } catch (err) {
                console.error('Failed to fetch financial data:', err)
            }
        }
        fetchFinancialData()
    }, [organizationId, organizationType])

    useEffect(() => {
        if (event) {
            const eventData = event as any
            setFormData({
                title: event.title,
                featured_image_url: event.featured_image_url || '',
                body: event.body || '',
                tags: event.tags || [],
                start_date: event.start_date ? new Date(event.start_date).toISOString() : '',
                end_date: event.end_date ? new Date(event.end_date).toISOString() : '',
                location: event.location || '',
                price: event.price?.toString() || '',
                capacity_groups: event.capacity_groups?.toString() || '',
                capacity_scouters: event.capacity_scouters?.toString() || '',
                capacity_youth: event.capacity_youth?.toString() || '',
                visibility: event.visibility,
                pricing_mode: event.pricing_mode || 'per_scout',
                price_scouter: event.price_scouter?.toString() || '',
                price_youth: event.price_youth?.toString() || '',
                require_participant_info: event.require_participant_info,
                require_payment: event.require_payment,
                payment_method: eventData.payment_method || '',
                published: event.published,
            })
            // Load selected sections if visibility is sections_only
            if (event.visibility === 'sections_only' && eventData.selected_section_types) {
                setSelectedSections(eventData.selected_section_types)
            } else {
                setSelectedSections([])
            }
        } else {
            setSelectedSections([])
        }
    }, [event])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [id]: checked }))
    }

    const handleRichTextChange = (content: string) => {
        setFormData(prev => ({ ...prev, body: content }))
    }

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault()
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Ensure all values are primitives to avoid circular reference errors
            const payload: any = {
                title: String(formData.title || ''),
                featured_image_url: formData.featured_image_url ? String(formData.featured_image_url) : null,
                body: formData.body ? String(formData.body) : null,
                tags: Array.isArray(formData.tags) ? formData.tags.map(String) : [],
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
                location: formData.location ? String(formData.location) : null,
                visibility: String(formData.visibility),
                pricing_mode: formData.require_payment && formData.pricing_mode ? String(formData.pricing_mode) : null,
                require_participant_info: Boolean(formData.require_participant_info),
                require_payment: Boolean(formData.require_payment),
                payment_method: formData.require_payment && formData.payment_method ? String(formData.payment_method) : null,
                selected_section_types: formData.visibility === 'sections_only' && Array.isArray(selectedSections) ? selectedSections.map(String) : [],
                published: Boolean(formData.published),
            }

            // Handle pricing based on mode (only if payment is required)
            if (formData.require_payment) {
                if (formData.pricing_mode === 'per_group') {
                    payload.price = formData.price ? parseFloat(formData.price) : null
                } else if (formData.pricing_mode === 'per_scout') {
                    payload.price = formData.price ? parseFloat(formData.price) : null
                } else if (formData.pricing_mode === 'per_person_type') {
                    payload.price_scouter = formData.price_scouter ? parseFloat(formData.price_scouter) : null
                    payload.price_youth = formData.price_youth ? parseFloat(formData.price_youth) : null
                }
            } else {
                // Clear pricing if payment is not required
                payload.price = null
                payload.price_scouter = null
                payload.price_youth = null
            }

            // Handle capacity
            payload.capacity_groups = formData.capacity_groups ? parseInt(formData.capacity_groups) : null
            payload.capacity_scouters = formData.capacity_scouters ? parseInt(formData.capacity_scouters) : null
            payload.capacity_youth = formData.capacity_youth ? parseInt(formData.capacity_youth) : null

            const url = event
                ? `/api/organizations/${organizationType}/${organizationId}/events/${event.id}`
                : `/api/organizations/${organizationType}/${organizationId}/events`

            const method = event ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${event ? 'update' : 'create'} event`)
            }

            onSuccess()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                />
            </div>

            <EventFeaturedImageUpload
                organizationId={organizationId}
                organizationType={organizationType}
                eventId={event?.id || null}
                currentImageUrl={formData.featured_image_url}
                onImageUpdate={(imageUrl) => setFormData(prev => ({ ...prev, featured_image_url: imageUrl || '' }))}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                    <Label htmlFor="start_date">Start Date & Time *</Label>
                    <Flatpickr
                        value={formData.start_date ? new Date(formData.start_date) : undefined}
                        onChange={(dates) => {
                            if (dates && dates.length > 0) {
                                setFormData(prev => ({ ...prev, start_date: dates[0].toISOString() }))
                            } else {
                                setFormData(prev => ({ ...prev, start_date: '' }))
                            }
                        }}
                        options={{
                            enableTime: true,
                            dateFormat: 'Y-m-d H:i',
                            time_24hr: true,
                            allowInput: true,
                            static: true,
                            clickOpens: true,
                            locale: {
                                firstDayOfWeek: 1,
                            },
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                        placeholder="Select start date and time"
                    />
                </div>
                <div className="flex flex-col space-y-2">
                    <Label htmlFor="end_date">End Date & Time</Label>
                    <Flatpickr
                        value={formData.end_date ? new Date(formData.end_date) : undefined}
                        onChange={(dates) => {
                            if (dates && dates.length > 0) {
                                setFormData(prev => ({ ...prev, end_date: dates[0].toISOString() }))
                            } else {
                                setFormData(prev => ({ ...prev, end_date: '' }))
                            }
                        }}
                        options={{
                            enableTime: true,
                            dateFormat: 'Y-m-d H:i',
                            time_24hr: true,
                            allowInput: true,
                            static: true,
                            clickOpens: true,
                            locale: {
                                firstDayOfWeek: 1,
                            },
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                        placeholder="Select end date and time (optional)"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Event location"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="body">Event Description</Label>
                <RichTextEditor
                    content={formData.body}
                    onChange={handleRichTextChange}
                    placeholder="Enter the event description..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <select
                    id="visibility"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={formData.visibility}
                    onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'open_to_all' | 'sections_only' | 'scouters_only' }))}
                >
                    <option value="open_to_all">Open to All</option>
                    <option value="sections_only">Select Sections</option>
                    <option value="scouters_only">Scouters Only</option>
                </select>
            </div>

            {formData.visibility === 'sections_only' && (
                <div className="space-y-2">
                    <Label>Select Sections</Label>
                    <div className="space-y-2">
                        {sectionTypes.map((sectionType) => (
                            <div key={sectionType} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`section_${sectionType}`}
                                    checked={selectedSections.includes(sectionType)}
                                    onCheckedChange={(checked) => {
                                        if (checked === true) {
                                            setSelectedSections(prev => [...prev, sectionType])
                                        } else {
                                            setSelectedSections(prev => prev.filter(s => s !== sectionType))
                                        }
                                    }}
                                />
                                <SectionIcon section={sectionType} size={24} />
                                <Label htmlFor={`section_${sectionType}`} className="cursor-pointer capitalize">
                                    {sectionType === 'ventures' ? 'Ventures' : sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="require_payment"
                        checked={formData.require_payment}
                        onCheckedChange={(checked) => handleCheckboxChange('require_payment', checked as boolean)}
                    />
                    <Label htmlFor="require_payment" className="cursor-pointer">
                        Take Payment
                    </Label>
                </div>
            </div>

            {formData.require_payment && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <select
                            id="payment_method"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            value={formData.payment_method}
                            onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                        >
                            <option value="">Select payment method</option>
                            <option value="offline">Take payment offline</option>
                            <option
                                value="bank_payment"
                                disabled={!financialData.has_bank_details}
                            >
                                Bank Payment{!financialData.has_bank_details ? ' - add bank payment info under Organisation Billing to use this' : ''}
                            </option>
                            <option
                                value="stripe"
                                disabled={!financialData.stripe_keys_validated}
                            >
                                Online Payment (Stripe){!financialData.stripe_keys_validated ? ' - add Stripe keys under Organisation Billing to use Stripe' : ''}
                            </option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pricing_mode">Pricing Mode</Label>
                        <select
                            id="pricing_mode"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            value={formData.pricing_mode || 'per_scout'}
                            onChange={(e) => setFormData(prev => ({ ...prev, pricing_mode: e.target.value as 'per_group' | 'per_scout' | 'per_person_type' }))}
                        >
                            <option value="per_group">Per Group</option>
                            <option value="per_scout">Per Youth Member</option>
                            <option value="per_person_type">Different Prices (Scouters/Youth)</option>
                        </select>
                    </div>

                    {formData.pricing_mode === 'per_person_type' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price_scouter">Price for Scouters (€)</Label>
                                <Input
                                    id="price_scouter"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price_scouter}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price_youth">Price for Youth (€)</Label>
                                <Input
                                    id="price_youth"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price_youth}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="price">
                                {formData.pricing_mode === 'per_scout'
                                    ? 'Price Per Youth Member (€)'
                                    : formData.pricing_mode === 'per_group'
                                        ? 'Price per Group (€)'
                                        : 'Price (€)'}
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                            />
                        </div>
                    )}

                    {/* Stripe Fee Calculator */}
                    {formData.payment_method === 'stripe' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                            <p className="text-sm font-medium text-blue-900">Stripe Fee Information</p>
                            {formData.pricing_mode === 'per_person_type' ? (
                                <>
                                    {formData.price_scouter && parseFloat(formData.price_scouter) > 0 && (
                                        <div className="text-sm text-blue-800">
                                            <span className="font-medium">Scouter Price:</span> {formatCurrency(parseFloat(formData.price_scouter))}
                                            <br />
                                            <span className="text-xs">After Stripe fees (1.4% + €0.25): {formatCurrency(calculateNetAmount(parseFloat(formData.price_scouter)))}</span>
                                        </div>
                                    )}
                                    {formData.price_youth && parseFloat(formData.price_youth) > 0 && (
                                        <div className="text-sm text-blue-800 mt-2">
                                            <span className="font-medium">Youth Price:</span> {formatCurrency(parseFloat(formData.price_youth))}
                                            <br />
                                            <span className="text-xs">After Stripe fees (1.4% + €0.25): {formatCurrency(calculateNetAmount(parseFloat(formData.price_youth)))}</span>
                                        </div>
                                    )}
                                </>
                            ) : formData.price && parseFloat(formData.price) > 0 ? (
                                <div className="text-sm text-blue-800">
                                    <span className="font-medium">Price:</span> {formatCurrency(parseFloat(formData.price))}
                                    <br />
                                    <span className="text-xs">After Stripe fees (1.4% + €0.25): {formatCurrency(calculateNetAmount(parseFloat(formData.price)))}</span>
                                </div>
                            ) : null}
                            <p className="text-xs text-blue-700 mt-2">
                                💡 Consider increasing your price to account for Stripe fees if needed
                            </p>
                        </div>
                    )}
                </>
            )}

            <div className="space-y-4">
                <Label>Capacity (optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="capacity_groups">Groups</Label>
                        <Input
                            id="capacity_groups"
                            type="number"
                            min="0"
                            value={formData.capacity_groups}
                            onChange={handleInputChange}
                            placeholder="Unlimited"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="capacity_scouters">Scouters</Label>
                        <Input
                            id="capacity_scouters"
                            type="number"
                            min="0"
                            value={formData.capacity_scouters}
                            onChange={handleInputChange}
                            placeholder="Unlimited"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="capacity_youth">Youth Members</Label>
                        <Input
                            id="capacity_youth"
                            type="number"
                            min="0"
                            value={formData.capacity_youth}
                            onChange={handleInputChange}
                            placeholder="Unlimited"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                    <Input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddTag(e)
                            }
                        }}
                        placeholder="Add a tag and press Enter"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                        Add
                    </Button>
                </div>
                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>


            <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {event ? 'Update Event' : 'Create Event'}
                </Button>
            </div>
        </form>
    )
}

