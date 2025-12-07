"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, UserPlus, Users } from "lucide-react"
import Flatpickr from "react-flatpickr"
import "flatpickr/dist/flatpickr.min.css"

interface ParticipantConfig {
    participant_types: ('scouter' | 'youth_member')[]
    selected_sections?: string[]
    scouter_fields: Record<string, boolean>
    youth_fields: Record<string, boolean>
}

interface ParticipantsInputProps {
    value: any[]
    onChange: (value: any[]) => void
    config: ParticipantConfig
}

export function ParticipantsInput({ value = [], onChange, config }: ParticipantsInputProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    // Default to first allowed type
    const defaultType = config.participant_types[0] || 'youth_member'

    const addParticipant = () => {
        const newParticipant = {
            type: defaultType,
            first_name: '',
            last_name: '',
            // Add other fields as needed
        }
        onChange([...value, newParticipant])
        // Automatically start editing the new participant
        setEditingIndex(value.length)
    }

    const removeParticipant = (index: number) => {
        const newValue = [...value]
        newValue.splice(index, 1)
        onChange(newValue)
        if (editingIndex === index) {
            setEditingIndex(null)
        }
    }

    const updateParticipant = (index: number, field: string, val: any) => {
        const newValue = [...value]
        newValue[index] = { ...newValue[index], [field]: val }
        onChange(newValue)
    }

    return (
        <div className="space-y-4">
            {value.map((participant, index) => (
                <Card key={index} className="relative">
                    <CardContent className="pt-6">
                        <div className="absolute top-2 right-2 flex gap-2">
                            {/* Remove Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeParticipant(index)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {/* Type Selection (only if multiple types allowed) */}
                            {config.participant_types.length > 1 && (
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={participant.type}
                                        onValueChange={(val) => updateParticipant(index, 'type', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {config.participant_types.includes('youth_member') && (
                                                <SelectItem value="youth_member">Youth Member</SelectItem>
                                            )}
                                            {config.participant_types.includes('scouter') && (
                                                <SelectItem value="scouter">Scouter</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Render fields - Order: First Name, Last Name, Date of Birth, Email, Phone */}
                            <div className="grid grid-cols-2 gap-4">
                                {(participant.type === 'scouter' ? config.scouter_fields : config.youth_fields)?.first_name && (
                                    <div className="grid gap-2">
                                        <Label>First Name</Label>
                                        <Input
                                            value={participant.first_name}
                                            onChange={(e) => updateParticipant(index, 'first_name', e.target.value)}
                                            placeholder="First Name"
                                        />
                                    </div>
                                )}
                                {(participant.type === 'scouter' ? config.scouter_fields : config.youth_fields)?.last_name && (
                                    <div className="grid gap-2">
                                        <Label>Last Name</Label>
                                        <Input
                                            value={participant.last_name}
                                            onChange={(e) => updateParticipant(index, 'last_name', e.target.value)}
                                            placeholder="Last Name"
                                        />
                                    </div>
                                )}
                                {(participant.type === 'scouter' ? config.scouter_fields : config.youth_fields)?.date_of_birth && (
                                    <div className="grid gap-2">
                                        <Label>Date of Birth</Label>
                                        <Flatpickr
                                            value={participant.date_of_birth ? [new Date(participant.date_of_birth)] : []}
                                            onChange={(dates) => {
                                                if (dates && dates.length > 0) {
                                                    const date = dates[0]
                                                    // Format as YYYY-MM-DD manually to avoid timezone issues
                                                    const year = date.getFullYear()
                                                    const month = String(date.getMonth() + 1).padStart(2, '0')
                                                    const day = String(date.getDate()).padStart(2, '0')
                                                    updateParticipant(index, 'date_of_birth', `${year}-${month}-${day}`)
                                                } else {
                                                    updateParticipant(index, 'date_of_birth', '')
                                                }
                                            }}
                                            options={{
                                                dateFormat: 'd/m/Y',
                                                allowInput: true,
                                                static: true,
                                                clickOpens: true,
                                                locale: {
                                                    firstDayOfWeek: 1,
                                                },
                                            }}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="dd/mm/yyyy"
                                        />
                                    </div>
                                )}
                                {(participant.type === 'scouter' ? config.scouter_fields : config.youth_fields)?.email && (
                                    <div className="grid gap-2">
                                        <Label>Email</Label>
                                        <Input
                                            value={participant.email || ''}
                                            onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                                            placeholder="Email"
                                            type="email"
                                        />
                                    </div>
                                )}
                                {(participant.type === 'scouter' ? config.scouter_fields : config.youth_fields)?.phone && (
                                    <div className="grid gap-2">
                                        <Label>Phone</Label>
                                        <Input
                                            value={participant.phone || ''}
                                            onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                                            placeholder="Phone"
                                            type="tel"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Section Selection for Youth */}
                            {participant.type === 'youth_member' && config.selected_sections && config.selected_sections.length > 0 && (
                                <div className="grid gap-2 col-span-2">
                                    <Label>Section</Label>
                                    <Select
                                        value={participant.section}
                                        onValueChange={(val) => updateParticipant(index, 'section', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {config.selected_sections.map(section => (
                                                <SelectItem key={section} value={section} className="capitalize">
                                                    {section.replace(/_/g, ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))
            }

            <Button type="button" variant="outline" onClick={addParticipant} className="w-full border-dashed">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Participant
            </Button>

            {
                value.length === 0 && (
                    <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
                        <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No participants added yet.</p>
                    </div>
                )
            }
        </div >
    )
}
