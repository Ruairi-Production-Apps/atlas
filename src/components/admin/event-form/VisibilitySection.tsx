
import React from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { SectionIcon } from '@/components/shared/section-icon'
import { EventFormData } from '@/hooks/use-event-form'

interface VisibilitySectionProps {
    formData: EventFormData
    handleInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    selectedSections: string[]
    setSelectedSections: React.Dispatch<React.SetStateAction<string[]>>
}

export function VisibilitySection({
    formData,
    handleInputChange,
    selectedSections,
    setSelectedSections
}: VisibilitySectionProps) {
    const sectionTypes = ['beavers', 'cubs', 'scouts', 'ventures', 'rovers'] as const

    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <select
                    id="visibility"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.visibility}
                    onChange={handleInputChange}
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
        </>
    )
}
