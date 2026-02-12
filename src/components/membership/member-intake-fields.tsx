"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface FormField {
    id: string
    field_type: string
    label: string
    required: boolean
    options?: string[]
    content_config?: any
    address_config?: any
}

interface MemberIntakeFieldsProps {
    index: number // Index in the useFieldArray
    fields: FormField[]
}

export function MemberIntakeFields({ index, fields }: MemberIntakeFieldsProps) {
    const { register, setValue, watch, formState: { errors } } = useFormContext()

    // Prefix for field names to work with useFieldArray (e.g., members.0.first_name)
    const namePrefix = `members.${index}.data`

    return (
        <div className="space-y-6 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-lg font-bold">Child #{index + 1} Details</h3>

            {fields.map((field) => {
                const fieldName = `${namePrefix}.${field.id}`
                const fieldId = `${fieldName}-${field.id}`
                const error = (errors.members as any)?.[index]?.data?.[field.id]

                return (
                    <div key={field.id} className="space-y-2">
                        {!['checkbox', 'heading', 'paragraph', 'section_break'].includes(field.field_type) && (
                            <Label htmlFor={fieldId}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>
                        )}

                        {field.field_type === 'short_text' && (
                            <Input
                                id={fieldId}
                                {...register(fieldName, { required: field.required })}
                            />
                        )}

                        {field.field_type === 'long_text' && (
                            <Textarea
                                id={fieldId}
                                {...register(fieldName, { required: field.required })}
                            />
                        )}

                        {field.field_type === 'email' && (
                            <Input
                                id={fieldId}
                                type="email"
                                {...register(fieldName, {
                                    required: field.required,
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                        message: 'Invalid email'
                                    }
                                })}
                            />
                        )}

                        {field.field_type === 'number' && (
                            <Input
                                id={fieldId}
                                type="number"
                                {...register(fieldName, {
                                    required: field.required,
                                    valueAsNumber: true
                                })}
                            />
                        )}

                        {field.field_type === 'date' && (
                            <Input
                                id={fieldId}
                                type="date"
                                {...register(fieldName, { required: field.required })}
                            />
                        )}

                        {field.field_type === 'checkbox' && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={fieldId}
                                    onCheckedChange={(checked) => setValue(fieldName, checked)}
                                />
                                <Label htmlFor={fieldId} className="font-normal cursor-pointer">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </Label>
                                <input type="hidden" {...register(fieldName, { required: field.required })} />
                            </div>
                        )}

                        {field.field_type === 'select' && (
                            <>
                                <input type="hidden" {...register(fieldName, { required: field.required })} />
                                <Select onValueChange={(val) => setValue(fieldName, val)}>
                                    <SelectTrigger id={fieldId}>
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options?.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}

                        {field.field_type === 'address' && (
                            <div className="space-y-3 p-4 border rounded bg-muted/20">
                                {field.address_config && Object.entries(field.address_config).map(([key, config]: [string, any]) => {
                                    if (!config.enabled) return null
                                    const addrName = `${fieldName}.${key}`
                                    return (
                                        <div key={key} className="space-y-1">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">{config.label}</Label>
                                            <Input
                                                {...register(addrName, { required: config.required })}
                                                placeholder={config.label}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {field.field_type === 'heading' && field.content_config && (
                            <h4 className="text-md font-bold mt-4">{field.content_config.heading_text}</h4>
                        )}

                        {field.field_type === 'paragraph' && field.content_config && (
                            <p className="text-sm text-muted-foreground">{field.content_config.paragraph_text}</p>
                        )}

                        {error && (
                            <p className="text-xs text-red-500 font-medium">{error.message || 'This field is required'}</p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
