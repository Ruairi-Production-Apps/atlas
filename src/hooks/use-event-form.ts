
import { useState, useEffect } from 'react'

export interface Event {
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
    category: 'youth_programme' | 'training' | 'national' | null
    is_all_day: boolean
    published: boolean
    google_map_link: string | null
    location_type: 'in_person' | 'online'
    online_meeting_link: string | null
    gear_list_id: string | null
}

export type EventFormData = {
    title: string
    featured_image_url: string
    body: string
    tags: string[]
    start_date: string
    end_date: string
    location: string
    price: string
    capacity_groups: string
    capacity_scouters: string
    capacity_youth: string
    visibility: 'open_to_all' | 'sections_only' | 'scouters_only'
    pricing_mode: 'per_group' | 'per_scout' | 'per_person_type'
    price_scouter: string
    price_youth: string
    require_participant_info: boolean
    require_payment: boolean
    payment_method: string
    category: string
    is_all_day: boolean
    published: boolean
    google_map_link: string
    location_type: 'in_person' | 'online'
    online_meeting_link: string
    gear_list_id: string | null
}

interface UseEventFormProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team' | 'sitewide'
    event?: Event | null
    onSuccess: () => void
}

export function useEventForm({
    organizationId,
    organizationType,
    event,
    onSuccess,
}: UseEventFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedSections, setSelectedSections] = useState<string[]>([])
    const [financialData, setFinancialData] = useState<{
        stripe_keys_validated: boolean
        has_bank_details: boolean
    }>({
        stripe_keys_validated: false,
        has_bank_details: false,
    })

    const [formData, setFormData] = useState<EventFormData>({
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
        category: event?.category || '',
        is_all_day: event?.is_all_day || false,
        published: event?.published ?? true,
        google_map_link: event?.google_map_link || '',
        location_type: event?.location_type || 'in_person',
        online_meeting_link: event?.online_meeting_link || '',
        gear_list_id: event?.gear_list_id || null,
    })

    // Fetch financial data on mount
    useEffect(() => {
        const fetchFinancialData = async () => {
            if (organizationType === 'sitewide') return

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

    // Update form data when event prop changes
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
                category: event.category || '',
                is_all_day: event.is_all_day || false,
                published: event.published,
                google_map_link: event.google_map_link || '',
                location_type: event.location_type || 'in_person',
                online_meeting_link: event.online_meeting_link || '',
                gear_list_id: event.gear_list_id || null,
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target
        // Special handling for selects that might use 'id' or 'name' or passed directly
        // The original code uses id for inputs. For selects, it also used id.
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    // Helper for direct value setting (useful for custom components like Flatpickr)
    const setFieldValue = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [id]: checked }))
    }

    const handleRichTextChange = (content: string) => {
        setFormData(prev => ({ ...prev, body: content }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('handleSubmit called', { eventId: event?.id, isUpdate: !!event })
        setLoading(true)
        setError(null)

        try {
            // Ensure all values are primitives to avoid circular reference errors
            const payload: any = {
                title: String(formData.title || ''),
                featured_image_url: formData.featured_image_url ? String(formData.featured_image_url) : null,
                body: formData.body ? String(formData.body) : null,
                tags: Array.isArray(formData.tags) ? formData.tags.map(String) : [],
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                location: formData.location ? String(formData.location) : null,
                visibility: String(formData.visibility),
                pricing_mode: formData.require_payment && formData.pricing_mode ? String(formData.pricing_mode) : null,
                require_participant_info: Boolean(formData.require_participant_info),
                require_payment: Boolean(formData.require_payment),
                payment_method: formData.require_payment && formData.payment_method ? String(formData.payment_method) : null,
                category: formData.category || null,
                is_all_day: Boolean(formData.is_all_day),
                selected_section_types: formData.visibility === 'sections_only' && Array.isArray(selectedSections) ? selectedSections.map(String) : [],
                published: Boolean(formData.published),
                google_map_link: formData.google_map_link ? String(formData.google_map_link) : null,
                location_type: formData.location_type || 'in_person',
                online_meeting_link: formData.online_meeting_link ? String(formData.online_meeting_link) : null,
                gear_list_id: formData.gear_list_id || null,
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

            console.log('Using payload:', payload)
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                let errorMessage = data.error || `Failed to ${event ? 'update' : 'create'} event`

                if (data.details) {
                    // Format validation errors into a readable string
                    const details = Object.entries(data.details)
                        .map(([key, issues]: [string, any]) => `${key}: ${issues.join(', ')}`)
                        .join('; ')
                    if (details) {
                        errorMessage += ` (${details})`
                    }
                }
                throw new Error(errorMessage)
            }

            onSuccess()
        } catch (err: any) {
            console.error('handleSubmit error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        formData,
        setFormData, // Exposed for flexibility if needed by specific components
        setFieldValue,
        selectedSections,
        setSelectedSections,
        financialData,
        loading,
        error,
        handleInputChange,
        handleCheckboxChange,
        handleRichTextChange,
        handleSubmit
    }
}
