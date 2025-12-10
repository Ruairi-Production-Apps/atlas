'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input' // Fallback for direct input

interface TagInputProps {
    selectedTags: string[]
    onTagsChange: (value: string[]) => void
    placeholder?: string
}

export function TagInput({ selectedTags = [], onTagsChange, placeholder = "Select tags..." }: TagInputProps) {
    const value = selectedTags || []
    const onChange = onTagsChange
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')
    const [suggestions, setSuggestions] = React.useState<{ name: string }[]>([])
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const fetchTags = async () => {
            setLoading(true)
            try {
                const search = inputValue.trim()
                const response = await fetch(`/api/tags${search ? `?q=${encodeURIComponent(search)}` : ''}`)
                if (response.ok) {
                    const data = await response.json()
                    setSuggestions(data)
                }
            } catch (error) {
                console.error('Failed to fetch tags:', error)
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(() => {
            if (open) {
                fetchTags()
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [inputValue, open])

    const handleSelect = (currentValue: string) => {
        if (!value.includes(currentValue)) {
            onChange([...value, currentValue])
        }
        setInputValue('')
        setOpen(false)
    }

    const handleRemove = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const tag = inputValue.trim()
            if (tag && !value.includes(tag)) {
                handleSelect(tag)
            }
        }
    }

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] relative focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-background cursor-text" onClick={() => setOpen(true)}>
                        {value.length === 0 && (
                            <span className="text-muted-foreground text-sm self-center ml-1 select-none">
                                {placeholder}
                            </span>
                        )}
                        {value.map((tag) => (
                            <Badge key={tag} variant="secondary" className="mr-1">
                                {tag}
                                <button
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleRemove(tag);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(tag)
                                    }}
                                >
                                    <X className="h-3 w-3 hover:text-destructive text-muted-foreground" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search existing tags..."
                            value={inputValue}
                            onValueChange={setInputValue}
                            onKeyDown={handleKeyDown}
                        />
                        <CommandList>
                            {loading && <div className="py-2 text-center text-sm text-muted-foreground">Loading...</div>}
                            <CommandEmpty>
                                {inputValue ? (
                                    <button
                                        className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                        onClick={() => handleSelect(inputValue.trim())}
                                    >
                                        Create tag &quot;{inputValue}&quot;
                                    </button>
                                ) : (
                                    "No tags found."
                                )}
                            </CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                {suggestions.map((tag) => (
                                    <CommandItem
                                        key={tag.name}
                                        value={tag.name}
                                        onSelect={() => handleSelect(tag.name)}
                                    >
                                        {tag.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">Type to search existing tags or press Enter to create a new one.</p>
        </div>
    )
}
