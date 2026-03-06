"use client"

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Tag, Filter, XCircle, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { KnowledgebaseArticle } from "@/lib/supabase/queries"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getOptimizedImageUrl } from "@/lib/utils"
import { AdventureSkillBadge } from "@/components/knowledgebase/adventure-skill-badge"
import { FileText } from "lucide-react"

interface KnowledgebaseClientProps {
    initialArticles: KnowledgebaseArticle[]
    initialProvinces: Array<{ id: string; name: string }>
    initialCounties: Array<{ id: string; name: string }>
    initialGroups: Array<{ id: string; name: string }>
    currentPage: number
    totalPages: number
}

export function KnowledgebaseClient({
    initialArticles,
    initialProvinces,
    initialCounties,
    initialGroups,
    currentPage,
    totalPages: initialTotalPages,
}: KnowledgebaseClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const [articles, setArticles] = useState(initialArticles)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [provinces] = useState(initialProvinces)
    const [counties, setCounties] = useState(initialCounties)
    const [groups, setGroups] = useState(initialGroups)

    const search = searchParams.get('search') || ''
    const provinceId = searchParams.get('provinceId') || ''
    const countyId = searchParams.get('countyId') || ''
    const groupId = searchParams.get('groupId') || ''
    const [selectedAdventureSkills, setSelectedAdventureSkills] = useState<string[]>(
        searchParams.get('adventureSkills') ? searchParams.get('adventureSkills')!.split(',') : []
    )
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.get('categories') ? searchParams.get('categories')!.split(',') : []
    )
    const [selectedSections, setSelectedSections] = useState<string[]>(
        searchParams.get('sections') ? searchParams.get('sections')!.split(',') : []
    )

    const CATEGORIES = ['Adventure Skills', 'ONE Programme', 'Training', 'Games', 'Youth Programme', 'Book/Guide', 'Session Plan', 'Safeguarding', 'Other']

    const ADVENTURE_SKILLS = [
        { name: 'Camping', icon: '/images/adventure_skills/camping.jpg' },
        { name: 'Backwoods', icon: '/images/adventure_skills/backwoods.jpg' },
        { name: 'Pioneering', icon: '/images/adventure_skills/pioneering.jpg' },
        { name: 'Hillwalking', icon: '/images/adventure_skills/hillwalking.jpg' },
        { name: 'Paddling', icon: '/images/adventure_skills/paddling.jpg' },
        { name: 'Rowing', icon: '/images/adventure_skills/rowing.jpg' },
        { name: 'Sailing', icon: '/images/adventure_skills/sailing.jpg' },
        { name: 'Emergencies', icon: '/images/adventure_skills/emergencies.jpg' },
        { name: 'Air', icon: '/images/adventure_skills/air.jpg' },
    ]

    const SECTIONS = [
        { name: 'Beavers', icon: '/images/scouting_ireland/Beavers Logo.png' },
        { name: 'Cubs', icon: '/images/scouting_ireland/Cubs Logo.png' },
        { name: 'Scouts', icon: '/images/scouting_ireland/Scouts Logo.png' },
        { name: 'Ventures', icon: '/images/scouting_ireland/Ventures Logo.png' },
        { name: 'Rovers', icon: '/images/scouting_ireland/Rovers Logo.png' },
    ]

    // Sync with server props
    useEffect(() => {
        setArticles(initialArticles)
        setTotalPages(initialTotalPages)
    }, [initialArticles, initialTotalPages])

    // Update filters and fetch new data
    const updateFilters = async (newFilters: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        // Reset dependent filters
        if (newFilters.provinceId !== undefined && !newFilters.provinceId) {
            params.delete('countyId')
            params.delete('groupId')
        }
        if (newFilters.countyId !== undefined && !newFilters.countyId) {
            params.delete('groupId')
        }

        // Reset page on filter change
        params.delete('page')

        startTransition(() => {
            router.push(`/knowledgebase?${params.toString()}`)
        })

        // Fetch new data for immediate updating
        try {
            const response = await fetch(`/api/knowledgebase?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setArticles(data.articles || [])
                setTotalPages(Math.ceil((data.count || 0) / 20))

                // Update counties if province changed
                if (newFilters.provinceId !== undefined) {
                    if (newFilters.provinceId) {
                        const countiesRes = await fetch(`/api/counties?provinceId=${newFilters.provinceId}`)
                        if (countiesRes.ok) {
                            const countiesData = await countiesRes.json()
                            setCounties(countiesData.counties || [])
                        }
                    } else {
                        setCounties([])
                    }
                }

                // Update groups if county changed
                if (newFilters.countyId !== undefined) {
                    if (newFilters.countyId) {
                        const groupsRes = await fetch(`/api/groups?countyId=${newFilters.countyId}`)
                        if (groupsRes.ok) {
                            const groupsData = await groupsRes.json()
                            setGroups(groupsData.groups || [])
                        }
                    } else {
                        setGroups([])
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch articles:', error)
        }
    }

    const handleSearchChange = (value: string) => {
        updateFilters({ search: value })
    }

    const handleProvinceChange = (value: string) => {
        updateFilters({ provinceId: value, countyId: '', groupId: '' })
    }

    const handleCountyChange = (value: string) => {
        updateFilters({ countyId: value, groupId: '' })
    }

    const handleGroupChange = (value: string) => {
        updateFilters({ groupId: value })
    }



    const handleAdventureSkillChange = (skill: string, checked: boolean) => {
        let newSkills: string[]
        if (checked) {
            newSkills = [...selectedAdventureSkills, skill]
        } else {
            newSkills = selectedAdventureSkills.filter(s => s !== skill)
        }
        setSelectedAdventureSkills(newSkills)
        updateFilters({ adventureSkills: newSkills.length > 0 ? newSkills.join(',') : '' })
    }

    const clearAdventureSkills = () => {
        setSelectedAdventureSkills([])
        updateFilters({ adventureSkills: '' })
    }

    const handleCategoryChange = (category: string, checked: boolean) => {
        let newCategories: string[]
        if (checked) {
            newCategories = [...selectedCategories, category]
        } else {
            newCategories = selectedCategories.filter(c => c !== category)
        }
        setSelectedCategories(newCategories)
        updateFilters({ categories: newCategories.length > 0 ? newCategories.join(',') : '' })
    }

    const clearCategories = () => {
        setSelectedCategories([])
        updateFilters({ categories: '' })
    }

    const handleSectionChange = (section: string, checked: boolean) => {
        let newSections: string[]
        if (checked) {
            newSections = [...selectedSections, section]
        } else {
            newSections = selectedSections.filter(s => s !== section)
        }
        setSelectedSections(newSections)
        updateFilters({ sections: newSections.length > 0 ? newSections.join(',') : '' })
    }

    const clearSections = () => {
        setSelectedSections([])
        updateFilters({ sections: '' })
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not published'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <img src="/images/atlas/knowledgebase-badge.png" alt="Knowledgebase" className="h-12 w-12 object-contain" />
                    <h1 className="text-4xl font-bold">Knowledgebase</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-8">
                    Access resources and documentation from scouting organizations
                </p>

                {/* Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Search</label>
                                    <input
                                        type="text"
                                        placeholder="Search articles..."
                                        defaultValue={search}
                                        onChange={(e) => {
                                            if (searchTimeoutRef.current) {
                                                clearTimeout(searchTimeoutRef.current)
                                            }
                                            searchTimeoutRef.current = setTimeout(() => {
                                                handleSearchChange(e.target.value)
                                            }, 500)
                                        }}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Adventure Skills</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal text-muted-foreground h-[42px]">
                                                {selectedAdventureSkills.length > 0
                                                    ? `${selectedAdventureSkills.length} selected`
                                                    : "Select skills"}
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0" align="start">
                                            <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                                                {ADVENTURE_SKILLS.map((skill) => (
                                                    <div key={skill.name} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`filter-skill-${skill.name}`}
                                                            checked={selectedAdventureSkills.includes(skill.name)}
                                                            onCheckedChange={(checked) => handleAdventureSkillChange(skill.name, checked as boolean)}
                                                        />
                                                        <Label
                                                            htmlFor={`filter-skill-${skill.name}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                                                        >
                                                            <img
                                                                src={skill.icon}
                                                                alt={skill.name}
                                                                className="h-5 w-5 object-cover rounded-full"
                                                            />
                                                            {skill.name === 'Air' ? 'Air Activities' : skill.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                                {selectedAdventureSkills.length > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={clearAdventureSkills}
                                                        className="w-full h-8 px-2 mt-2 text-xs text-muted-foreground"
                                                    >
                                                        Clear Skills
                                                    </Button>
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Sections</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal text-muted-foreground h-[42px]">
                                                {selectedSections.length > 0
                                                    ? `${selectedSections.length} selected`
                                                    : "Select sections"}
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0" align="start">
                                            <div className="p-2 space-y-2">
                                                {SECTIONS.map((section) => (
                                                    <div key={section.name} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`filter-section-${section.name}`}
                                                            checked={selectedSections.includes(section.name)}
                                                            onCheckedChange={(checked) => handleSectionChange(section.name, checked as boolean)}
                                                        />
                                                        <Label
                                                            htmlFor={`filter-section-${section.name}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                                                        >
                                                            <img
                                                                src={section.icon}
                                                                alt={section.name}
                                                                className="h-5 w-5 object-contain"
                                                            />
                                                            {section.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                                {selectedSections.length > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={clearSections}
                                                        className="w-full h-8 px-2 mt-2 text-xs text-muted-foreground"
                                                    >
                                                        Clear Sections
                                                    </Button>
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Categories</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal text-muted-foreground h-[42px]">
                                                {selectedCategories.length > 0
                                                    ? `${selectedCategories.length} selected`
                                                    : "Select categories"}
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0" align="start">
                                            <div className="p-2 space-y-2">
                                                {CATEGORIES.map((category) => (
                                                    <div key={category} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`filter-category-${category}`}
                                                            checked={selectedCategories.includes(category)}
                                                            onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                                                        />
                                                        <Label
                                                            htmlFor={`filter-category-${category}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {category}
                                                        </Label>
                                                    </div>
                                                ))}
                                                {selectedCategories.length > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={clearCategories}
                                                        className="w-full h-8 px-2 mt-2 text-xs text-muted-foreground"
                                                    >
                                                        Clear Categories
                                                    </Button>
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Province</label>
                                    <select
                                        defaultValue={provinceId}
                                        onChange={(e) => handleProvinceChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">All Provinces</option>
                                        {provinces.map((province) => (
                                            <option key={province.id} value={province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {provinceId && (
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">County</label>
                                        <select
                                            defaultValue={countyId}
                                            onChange={(e) => handleCountyChange(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md"
                                        >
                                            <option value="">All Counties</option>
                                            {counties.map((county) => (
                                                <option key={county.id} value={county.id}>
                                                    {county.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {countyId && (
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Group</label>
                                        <select
                                            defaultValue={groupId}
                                            onChange={(e) => handleGroupChange(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md"
                                        >
                                            <option value="">All Groups</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/knowledgebase">Clear</Link>
                                </Button>
                            </div>
                        </div>
                        {selectedAdventureSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                                <span className="text-sm text-muted-foreground self-center mr-2">Adventure Skills:</span>
                                {selectedAdventureSkills.map((skillName) => {
                                    const skill = ADVENTURE_SKILLS.find(s => s.name === skillName)
                                    return (
                                        <Badge key={skillName} variant="secondary" className="pl-1 pr-1 py-1 flex items-center gap-1">
                                            {skill && (
                                                <img
                                                    src={skill.icon}
                                                    alt={skill.name}
                                                    className="h-4 w-4 object-cover rounded-full"
                                                />
                                            )}
                                            {skillName === 'Air' ? 'Air Activities' : skillName}
                                            <button
                                                onClick={() => handleAdventureSkillChange(skillName, false)}
                                                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                            >
                                                <XCircle className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )
                                })}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAdventureSkills}
                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                        {selectedCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                                <span className="text-sm text-muted-foreground self-center mr-2">Active Filters:</span>
                                {selectedCategories.map((category) => (
                                    <Badge key={category} variant="secondary" className="pl-2 pr-1 py-1">
                                        {category}
                                        <button
                                            onClick={() => handleCategoryChange(category, false)}
                                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                        >
                                            <XCircle className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCategories}
                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                        {selectedSections.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-dashed">
                                <span className="text-sm text-muted-foreground self-center mr-2">Sections:</span>
                                {selectedSections.map((sectionName) => {
                                    const section = SECTIONS.find(s => s.name === sectionName)
                                    return (
                                        <Badge key={sectionName} variant="outline" className="pl-1 pr-1 py-1 flex items-center gap-1">
                                            {section && (
                                                <img
                                                    src={section.icon}
                                                    alt={section.name}
                                                    className="h-4 w-4 object-contain"
                                                />
                                            )}
                                            {sectionName}
                                            <button
                                                onClick={() => handleSectionChange(sectionName, false)}
                                                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                            >
                                                <XCircle className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )
                                })}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSections}
                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Articles List */}
                {isPending ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size={40} />
                            </div>
                        </CardContent>
                    </Card>
                ) : articles.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No articles found. Try adjusting your filters.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <Link key={article.id} href={`/knowledgebase/${article.slug}`}>
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col p-0 overflow-hidden group">
                                        <div className="relative h-48 w-full bg-muted">
                                            {article.featured_image_url ? (
                                                <img
                                                    src={getOptimizedImageUrl(article.featured_image_url, 75)}
                                                    alt={article.title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <FileText className="h-12 w-12 text-muted-foreground/20" />
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 line-clamp-2 text-lg">
                                                {article.title}
                                            </CardTitle>
                                            <CardDescription>
                                                {formatDate(article.published_at || article.created_at)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col p-6 pt-0">
                                            {(article.description || article.body) && (
                                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                                    {article.description || article.body?.replace(/<[^>]*>/g, '').substring(0, 150)}
                                                </p>
                                            )}
                                            <div className="flex flex-col gap-2 mt-auto">
                                                {article.section_types && article.section_types.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {article.section_types.map((sectionName) => {
                                                            const section = SECTIONS.find(s => s.name === sectionName)
                                                            return (
                                                                <Badge key={sectionName} variant="outline" className="px-2 py-0.5 text-[10px] flex items-center gap-1 border-primary/20 bg-primary/5">
                                                                    {section && (
                                                                        <img
                                                                            src={section.icon}
                                                                            alt={section.name}
                                                                            className="h-3 w-3 object-contain"
                                                                        />
                                                                    )}
                                                                    {sectionName}
                                                                </Badge>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                                {article.adventure_skill && (
                                                    <div className="flex">
                                                        <AdventureSkillBadge skill={article.adventure_skill} className="py-1 px-2 text-xs" />
                                                    </div>
                                                )}
                                                {article.tags && article.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {article.tags.slice(0, 3).map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="text-xs px-2 py-1 bg-muted rounded-full flex items-center gap-1"
                                                            >
                                                                <Tag className="h-3 w-3" />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl="/knowledgebase"
                        />
                    </>
                )}
            </div>
        </div>
    )
}
