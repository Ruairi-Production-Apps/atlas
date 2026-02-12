"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Backpack, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GearList {
    id: string
    title: string
    published: boolean
    share_token: string
}

interface GearListSectionProps {
    organizationId: string
    organizationType: string
    gearListId: string | null
    setFieldValue: (field: string, value: any) => void
}

export function GearListSection({
    organizationId,
    organizationType,
    gearListId,
    setFieldValue
}: GearListSectionProps) {
    const [gearLists, setGearLists] = useState<GearList[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadGearLists()
    }, [organizationId, organizationType])

    const loadGearLists = async () => {
        setLoading(true)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/gear-lists`
            )
            const data = await response.json()

            if (response.ok) {
                // Only show published gear lists
                setGearLists((data.gearLists || []).filter((list: GearList) => list.published))
            }
        } catch (error) {
            console.error('Load gear lists error:', error)
        } finally {
            setLoading(false)
        }
    }

    const selectedGearList = gearLists.find(list => list.id === gearListId)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Backpack className="h-5 w-5" />
                    Gear List (Optional)
                </CardTitle>
                <CardDescription>
                    Attach a packing list to help participants prepare for this event
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="gear_list_id">Select Gear List</Label>
                    <Select
                        value={gearListId || 'none'}
                        onValueChange={(value) => setFieldValue('gear_list_id', value === 'none' ? null : value)}
                        disabled={loading}
                    >
                        <SelectTrigger id="gear_list_id">
                            <SelectValue placeholder={loading ? "Loading..." : "No gear list"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No gear list</SelectItem>
                            {gearLists.map(list => (
                                <SelectItem key={list.id} value={list.id}>
                                    {list.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {gearLists.length === 0 && !loading && (
                        <p className="text-xs text-muted-foreground">
                            No published gear lists available. Create one in the Gear tab first.
                        </p>
                    )}
                </div>

                {selectedGearList && (
                    <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Backpack className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{selectedGearList.title}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                        >
                            <a
                                href={`/gear-lists/${selectedGearList.share_token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                        </Button>
                    </div>
                )}

                <p className="text-xs text-muted-foreground">
                    Participants will see this gear list on the event details page and can use it to prepare what to bring.
                </p>
            </CardContent>
        </Card>
    )
}
