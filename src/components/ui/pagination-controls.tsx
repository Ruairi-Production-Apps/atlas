"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    baseUrl: string
    searchParamName?: string
}

export function PaginationControls({
    currentPage,
    totalPages,
    baseUrl,
    searchParamName = "page",
}: PaginationControlsProps) {
    const searchParams = useSearchParams()

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(searchParamName, page.toString())
        return `${baseUrl}?${params.toString()}`
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                asChild={currentPage > 1}
            >
                {currentPage > 1 ? (
                    <Link href={createPageUrl(currentPage - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className="cursor-not-allowed opacity-50">
                        <ChevronLeft className="h-4 w-4" />
                    </span>
                )}
            </Button>

            <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
            </span>

            <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                asChild={currentPage < totalPages}
            >
                {currentPage < totalPages ? (
                    <Link href={createPageUrl(currentPage + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className="cursor-not-allowed opacity-50">
                        <ChevronRight className="h-4 w-4" />
                    </span>
                )}
            </Button>
        </div>
    )
}
