"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "use-debounce"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MapPin, FileText, Calendar, ShoppingBag, BookOpen, ChevronRight } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

interface SearchResult {
    id: string
    type: string
    title: string
    subtitle: string
    url: string
    category: string
    image?: string | null
}

interface GlobalSearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
    const router = useRouter()
    const [query, setQuery] = React.useState("")
    const [debouncedQuery] = useDebounce(query, 300)
    const [results, setResults] = React.useState<SearchResult[]>([])
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const res = await fetch(`/api/global-search?q=${encodeURIComponent(debouncedQuery)}`)
                const data = await res.json()
                setResults(data.results || [])
            } catch (error) {
                console.error("Search failed:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [debouncedQuery])

    const handleSelect = (url: string) => {
        onOpenChange(false)
        router.push(url)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'province':
            case 'county':
            case 'group':
            case 'team':
                return <MapPin className="h-4 w-4" />
            case 'news':
                return <FileText className="h-4 w-4" />
            case 'event':
                return <Calendar className="h-4 w-4" />
            case 'product':
                return <ShoppingBag className="h-4 w-4" />
            case 'article':
                return <BookOpen className="h-4 w-4" />
            default:
                return <Search className="h-4 w-4" />
        }
    }

    // Group results by category
    const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.category]) acc[result.category] = []
        acc[result.category].push(result)
        return acc
    }, {} as Record<string, SearchResult[]>)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 max-w-2xl overflow-hidden sm:rounded-lg top-[5%] translate-y-0 sm:top-[10%]">
                <DialogTitle className="sr-only">Global Search</DialogTitle>
                <div className="flex items-center border-b px-4 py-3">
                    <Search className="mr-2 h-5 w-5 text-muted-foreground opacity-50" />
                    <Input
                        className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0 text-lg bg-transparent"
                        placeholder="Search for groups, events, news..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {loading && <LoadingSpinner size={20} />}
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {query.length > 0 && results.length === 0 && !loading && (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    )}

                    {query.length < 2 && (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            Type at least 2 characters to search...
                        </div>
                    )}

                    {Object.entries(groupedResults).map(([category, items]) => (
                        <div key={category} className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 mb-1">
                                {category}
                            </div>
                            <div>
                                {items.map((result) => (
                                    <button
                                        key={result.id + result.type}
                                        onClick={() => handleSelect(result.url)}
                                        className="w-full flex items-center px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors text-left group"
                                    >
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mr-3 overflow-hidden shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            {result.image ? (
                                                <img src={result.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                getIcon(result.type)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{result.title}</div>
                                            <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground flex justify-between">
                    <span>
                        Search across the entire platform
                    </span>
                    <span className="opacity-70">
                        Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">ESC</span></kbd> to close
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
