"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface EventsFilterProps {
    provinces: { id: string; name: string }[]
    counties: { id: string; name: string }[]
    groups: { id: string; name: string }[]
}

export function EventsFilter({ provinces, counties, groups }: EventsFilterProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const [isPending, startTransition] = useTransition()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set("search", term)
        } else {
            params.delete("search")
        }
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }, 500)

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== "all") {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        // Reset dependent filters
        if (key === "provinceId") {
            params.delete("countyId")
            params.delete("groupId")
        }
        if (key === "countyId") {
            params.delete("groupId")
        }
        if (key === "visibility" && value !== "sections_only") {
            params.delete("section")
        }

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    const clearFilters = () => {
        startTransition(() => {
            replace(pathname, { scroll: false })
        })
    }

    const hasFilters = searchParams.toString().length > 0

    return (
        <div className="space-y-4 relative">
            {isPending && (
                <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                    <LoadingSpinner size={48} />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Search events..."
                            className="pl-9"
                            defaultValue={searchParams.get("search")?.toString()}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                        defaultValue={searchParams.get("category")?.toString() || "all"}
                        onValueChange={(val) => handleFilterChange("category", val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="youth_programme">Youth Programme</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                            <SelectItem value="national">National</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Province</Label>
                    <Select
                        defaultValue={searchParams.get("provinceId")?.toString() || "all"}
                        onValueChange={(val) => handleFilterChange("provinceId", val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Provinces</SelectItem>
                            {provinces.map((province) => (
                                <SelectItem key={province.id} value={province.id}>
                                    {province.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Only show County if Province is selected (backend logic handles data, UI logic shows dropdown) */}
                {/* Note: In server component we passed filtered counties. Here we receive them. 
                    If province is not selected, counties list might be empty or full depending on implementation.
                    But better to check param existence to conditionally render if we want to be strict,
                    or just render what is passed.
                */}
                {(searchParams.get("provinceId") || counties.length > 0) && (
                    <div className="space-y-2">
                        <Label>County</Label>
                        <Select
                            defaultValue={searchParams.get("countyId")?.toString() || "all"}
                            onValueChange={(val) => handleFilterChange("countyId", val)}
                            disabled={counties.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select county" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Counties</SelectItem>
                                {counties.map((county) => (
                                    <SelectItem key={county.id} value={county.id}>
                                        {county.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Group Filter - conditionally shown directly in the grid */}
                {(searchParams.get("countyId") || groups.length > 0) && (
                    <div className="space-y-2">
                        <Label>Group</Label>
                        <Select
                            defaultValue={searchParams.get("groupId")?.toString() || "all"}
                            onValueChange={(val) => handleFilterChange("groupId", val)}
                            disabled={groups.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                {groups.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Section / Audience Filter */}
            <div className="space-y-2">
                <Label>Section / Audience</Label>
                <Select
                    value={searchParams.get("visibility")?.toString() || "sections_only"}
                    onValueChange={(val) => handleFilterChange("visibility", val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Youth Members" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Participants</SelectItem>
                        <SelectItem value="open_to_all">Open to All</SelectItem>
                        <SelectItem value="sections_only">Youth Members</SelectItem>
                        <SelectItem value="scouters_only">Scouters Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Section Filters - show when visibility is sections_only or not set (default) */}
            {(searchParams.get("visibility") === "sections_only" || !searchParams.get("visibility")) && (
                <div className="md:col-span-2 lg:col-span-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label className="block mb-2">Filter by Section</Label>
                    <div className="flex flex-wrap gap-3">
                        {/* All button */}
                        <button
                            onClick={() => handleFilterChange("section", "all")}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${!searchParams.get("section")
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-muted text-foreground border-border'
                                }`}
                        >
                            All
                        </button>
                        {[
                            { label: 'Beavers', value: 'beavers' },
                            { label: 'Cubs', value: 'cubs' },
                            { label: 'Scouts', value: 'scouts' },
                            { label: 'Ventures', value: 'ventures' },
                            { label: 'Rovers', value: 'rovers' }
                        ].map((item) => {
                            const isActive = searchParams.get("section") === item.value
                            return (
                                <button
                                    key={item.value}
                                    onClick={() => handleFilterChange("section", isActive ? "all" : item.value)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isActive
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background hover:bg-muted text-foreground border-border'
                                        }`}
                                >
                                    <img
                                        src={`/images/scouting_ireland/${item.label} Logo.png`}
                                        alt={item.label}
                                        className="w-6 h-6 object-contain"
                                    />
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}


            {hasFilters && (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    )
}
