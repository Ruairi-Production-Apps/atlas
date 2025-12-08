"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface GroupSectionsManagerProps {
    groupId: string
    organizationName: string
}

const SECTION_Types = [
    { type: 'beavers', label: 'Beavers', icon: '/images/sections/beavers.png' },
    { type: 'cubs', label: 'Cubs', icon: '/images/sections/cubs.png' },
    { type: 'scouts', label: 'Scouts', icon: '/images/sections/scouts.png' },
    { type: 'ventures', label: 'Ventures', icon: '/images/sections/ventures.png' },
    { type: 'rovers', label: 'Rovers', icon: '/images/sections/rovers.png' },
]

export function GroupSectionsManager({ groupId, organizationName }: GroupSectionsManagerProps) {
    const [activeSections, setActiveSections] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        loadSections()
    }, [groupId])

    const loadSections = async () => {
        const { data, error } = await supabase
            .from('sections')
            .select('section_type')
            .eq('group_id', groupId)

        if (error) {
            console.error('Error loading sections:', error)
            return
        }

        setActiveSections(data.map(s => s.section_type))
        setLoading(false)
    }

    const toggleSection = async (type: string, enabled: boolean) => {
        // Optimistic update
        const previousSections = [...activeSections]
        if (enabled) {
            setActiveSections(prev => [...prev, type])
        } else {
            setActiveSections(prev => prev.filter(t => t !== type))
        }

        try {
            if (enabled) {
                // Determine name based on Org Name + Section Type (e.g., "5th Wicklow Beavers")
                // Simple default naming: "{Group Name} {Section Label}"
                const sectionLabel = SECTION_Types.find(s => s.type === type)?.label
                const name = `${organizationName} ${sectionLabel}`

                const { error } = await supabase
                    .from('sections')
                    .insert({
                        group_id: groupId,
                        section_type: type as any, // database type cast
                        name: name
                    })

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('sections')
                    .delete()
                    .eq('group_id', groupId)
                    .eq('section_type', type)

                if (error) throw error
            }
        } catch (error: any) {
            console.error('Error updating section:', error)
            setActiveSections(previousSections)
            toast({
                title: "Error",
                description: "Failed to update section. Please try again.",
                variant: "destructive"
            })
        }
    }

    if (loading) return <div>Loading sections...</div>

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Available Sections</CardTitle>
                <CardDescription>
                    Enable the sections that are active in this group.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {SECTION_Types.map((section) => (
                        <div key={section.type} className="flex items-center space-x-4 border p-4 rounded-lg">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor={`section-${section.type}`} className="text-base font-medium">
                                    {section.label}
                                </Label>
                            </div>
                            <Switch
                                id={`section-${section.type}`}
                                checked={activeSections.includes(section.type)}
                                onCheckedChange={(checked: boolean) => toggleSection(section.type, checked)}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
