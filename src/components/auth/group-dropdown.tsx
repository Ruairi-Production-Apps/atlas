"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn, getOptimizedImageUrl } from "@/lib/utils"

interface Group {
    id: string
    name: string
    slug: string
    logo_url: string | null
    county_name?: string
    province_name?: string
}

interface GroupDropdownProps {
    groups: Group[]
    searchQuery: string
    onSearchChange: (query: string) => void
    onSelect: (groupId: string) => void
}

export function GroupDropdown({ groups, searchQuery, onSearchChange, onSelect }: GroupDropdownProps) {
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const listRef = useRef<HTMLDivElement>(null)
    const [itemRefs, setItemRefs] = useState<(HTMLButtonElement | null)[]>([])

    // Reset highlight when search changes
    useEffect(() => {
        setHighlightedIndex(0)
    }, [searchQuery])

    // Update refs array when groups change
    useEffect(() => {
        setItemRefs((refs) => Array(groups.length + 1).fill(null).map((_, i) => refs[i] || null))
    }, [groups.length])

    const totalItems = groups.length + 1 // +1 for "Not Listed"

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlightedIndex((prev) => {
                const next = (prev + 1) % totalItems
                scrollToItem(next)
                return next
            })
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlightedIndex((prev) => {
                const next = (prev - 1 + totalItems) % totalItems
                scrollToItem(next)
                return next
            })
        } else if (e.key === "Enter") {
            e.preventDefault()
            const selected = getSelectedItem(highlightedIndex)
            onSelect(selected)
        }
    }

    const scrollToItem = (index: number) => {
        const item = itemRefs[index]
        if (item) {
            item.scrollIntoView({ block: "nearest", behavior: "smooth" })
        }
    }

    const getSelectedItem = (index: number) => {
        if (index === 0) return 'not_listed'
        return groups[index - 1].id
    }

    return (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-hidden flex flex-col">
            <div className="p-2 border-b sticky top-0 bg-popover">
                <div className="flex items-center border rounded-md px-2">
                    <Search className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                        type="text"
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border-0 shadow-none focus-visible:ring-0 h-8 px-0"
                        autoFocus
                    />
                </div>
            </div>

            <div className="overflow-y-auto" ref={listRef}>
                {/* Not Listed Option (Index 0) */}
                <button
                    type="button"
                    ref={(el) => { itemRefs[0] = el }}
                    onClick={() => onSelect('not_listed')}
                    className={cn(
                        "w-full flex items-center px-3 py-2 hover:bg-accent transition-colors text-left border-b",
                        highlightedIndex === 0 && "bg-accent"
                    )}
                >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted mr-3 shrink-0">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">Not Listed</div>
                        <div className="text-xs text-muted-foreground">My group is not in the list</div>
                    </div>
                </button>

                {/* Group Options (Indices 1 to N) */}
                {groups.length === 0 && searchQuery ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No groups found
                    </div>
                ) : (
                    groups.map((group, i) => (
                        <button
                            key={group.id}
                            type="button"
                            ref={(el) => { itemRefs[i + 1] = el }}
                            onClick={() => onSelect(group.id)}
                            className={cn(
                                "w-full flex items-center px-3 py-2 hover:bg-accent transition-colors text-left",
                                highlightedIndex === i + 1 && "bg-accent"
                            )}
                        >
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mr-3 overflow-hidden shrink-0">
                                {group.logo_url ? (
                                    <img
                                        src={getOptimizedImageUrl(group.logo_url, 80)}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <MapPin className="h-4 w-4 text-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{group.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {[group.county_name, group.province_name].filter(Boolean).join(', ')}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
