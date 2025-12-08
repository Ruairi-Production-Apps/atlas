"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SectionLogoProps {
    type: string
    className?: string
}

export function SectionLogo({ type, className }: SectionLogoProps) {
    const [error, setError] = useState(false)
    const normalizedType = type.charAt(0).toUpperCase() + type.slice(1)
    const logoPath = `/images/scouting_ireland/${normalizedType} Logo.png`

    if (error) {
        return null
    }

    return (
        <img
            src={logoPath}
            alt={`${type} Logo`}
            className={cn("w-full h-full object-contain", className)}
            onError={() => setError(true)}
        />
    )
}
