"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

import { ParticipantsInput } from "@/components/events/participants-input"

interface FormField {
    id: string
    field_type: string
    label: string
    required: boolean
    options?: string[]
    participants_config?: any
}

interface FormRendererProps {
    formId: string
    eventId: string
    title: string
    description?: string
    fields: FormField[]
    groups: { id: string; name: string }[]
    event?: {
        require_payment: boolean
        payment_method: string | null
    }
}

export function FormRenderer({ formId, eventId, title, description, fields, groups, event }: FormRendererProps) {
    const methods = useForm()
    const { register, handleSubmit, formState: { errors }, setValue, watch, control } = methods
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const onSubmit = async (data: any) => {
        setSubmitting(true)
        try {
            // Check if this event requires Stripe payment
            if (event?.require_payment && event?.payment_method === 'stripe') {
                // Create Stripe Checkout session
                const response = await fetch(`/api/events/${eventId}/forms/${formId}/create-checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ submission_data: data })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to create checkout session')
                }

                const { url } = await response.json()

                // Redirect to Stripe Checkout
                window.location.href = url
                return
            }

            // Regular submission (no payment or non-Stripe payment)
            const response = await fetch(`/api/events/${eventId}/forms/${formId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submission_data: data })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Submission failed')
            }

            setSubmitted(true)
            toast({
                title: "Success!",
                description: "Your submission has been received.",
            })

        } catch (error: any) {
            console.error(error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="text-center py-12 space-y-4">
                <h2 className="text-2xl font-bold text-green-600">Thank You!</h2>
                <p className="text-muted-foreground">Your form has been successfully submitted.</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Submit Another Response
                </Button>
            </div>
        )
    }

    // We can remove the title/description rendering since the page does it, OR keep it but styled differently.
    // Given the prompt "Remove duplicate form title", I will remove the H1 title here.

    return (
        <div className="space-y-8">
            {/* Removed title/description container as per request to avoid duplication with Card */}

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>

                            {/* Short Text */}
                            {field.field_type === 'short_text' && (
                                <Input
                                    id={field.id}
                                    {...register(field.id, { required: field.required })}
                                />
                            )}

                            {/* Long Text */}
                            {field.field_type === 'long_text' && (
                                <Textarea
                                    id={field.id}
                                    {...register(field.id, { required: field.required })}
                                />
                            )}

                            {/* Select */}
                            {field.field_type === 'select' && (
                                <>
                                    <input type="hidden" {...register(field.id, { required: field.required })} />
                                    <Select
                                        onValueChange={(value) => setValue(field.id, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options?.map((opt) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            )}

                            {/* Group Field */}
                            {field.field_type === 'group' && (
                                <>
                                    <input type="hidden" {...register(field.id, { required: field.required })} />
                                    <Select
                                        onValueChange={(value) => setValue(field.id, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map((group) => (
                                                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            )}

                            {/* Participants Field */}
                            {field.field_type === 'participants' && (
                                <ParticipantsInput
                                    value={watch(field.id) || []}
                                    onChange={(val) => setValue(field.id, val)}
                                    config={field.participants_config || {
                                        participant_types: ['youth_member'],
                                        scouter_fields: {},
                                        youth_fields: { first_name: true, last_name: true }
                                    }}
                                />
                            )}

                            {/* Radio, Multi-Select etc... */}
                            {field.field_type === 'radio' && (
                                <RadioGroup
                                    onValueChange={(value) => setValue(field.id, value)}
                                >
                                    {field.options?.map((opt) => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                                            <Label htmlFor={`${field.id}-${opt}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

                            {field.field_type === 'multi_select' && (
                                <div className="space-y-2">
                                    {field.options?.map((opt) => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${field.id}-${opt}`}
                                                onCheckedChange={(checked) => {
                                                    const current = watch(field.id) || []
                                                    if (checked) {
                                                        setValue(field.id, [...current, opt])
                                                    } else {
                                                        setValue(field.id, current.filter((v: string) => v !== opt))
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`${field.id}-${opt}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors[field.id] && (
                                <p className="text-sm text-red-500">This field is required</p>
                            )}
                        </div>
                    ))}

                    {/* ... submit button ... */}

                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting && <LoadingSpinner size={16} className="mr-2" />}
                        Submit
                    </Button>
                </form>
            </FormProvider>
        </div>
    )
}
