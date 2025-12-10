
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { EventFormData } from '@/hooks/use-event-form'

interface CapacitySectionProps {
    formData: EventFormData
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function CapacitySection({ formData, handleInputChange }: CapacitySectionProps) {
    return (
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
    )
}
