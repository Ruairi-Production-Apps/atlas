"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Backpack, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface GearListItem {
    id: string
    item_name: string
    quantity: number
    category: string | null
    notes: string | null
}

interface GearList {
    id: string
    title: string
    description: string | null
    share_token: string
    items?: GearListItem[]
}

interface EventGearListCardProps {
    gearList: GearList
}

export function EventGearListCard({ gearList }: EventGearListCardProps) {
    const [expanded, setExpanded] = useState(false)

    // Group items by category
    const itemsByCategory: Record<string, GearListItem[]> = {}
    if (gearList.items) {
        gearList.items.forEach(item => {
            const category = item.category || 'Other'
            if (!itemsByCategory[category]) {
                itemsByCategory[category] = []
            }
            itemsByCategory[category].push(item)
        })
    }

    const categories = Object.keys(itemsByCategory).sort()
    const totalItems = gearList.items?.length || 0

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2">
                            <Backpack className="h-5 w-5" />
                            Gear List
                        </CardTitle>
                        <CardDescription>
                            What to bring for this event
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                    >
                        <a
                            href={`/gear-lists/${gearList.share_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Full List
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-1">{gearList.title}</h4>
                    {gearList.description && (
                        <p className="text-sm text-muted-foreground">
                            {gearList.description}
                        </p>
                    )}
                    <div className="mt-2">
                        <Badge variant="secondary">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                        </Badge>
                    </div>
                </div>

                {totalItems > 0 && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className="w-full"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="mr-2 h-4 w-4" />
                                    Hide Items
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="mr-2 h-4 w-4" />
                                    Show Items
                                </>
                            )}
                        </Button>

                        {expanded && (
                            <div className="space-y-3 pt-2 border-t">
                                <ul className="space-y-1">
                                    {(gearList.items || []).slice(0, 15).map((item) => (
                                        <li key={item.id} className="text-sm flex items-center gap-2">
                                            <span className="text-muted-foreground">•</span>
                                            <span>{item.item_name}</span>
                                            {item.quantity > 1 && (
                                                <Badge variant="outline" className="text-xs">
                                                    × {item.quantity}
                                                </Badge>
                                            )}
                                        </li>
                                    ))}
                                    {(gearList.items?.length || 0) > 15 && (
                                        <li className="text-sm text-muted-foreground italic">
                                            + {(gearList.items?.length || 0) - 15} more items
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
