"use client"

import { cn } from "@/lib/utils"

interface AdventureSkillBadgeProps {
    skill: string
    className?: string
    showLabel?: boolean
}

export function AdventureSkillBadge({ skill, className, showLabel = true }: AdventureSkillBadgeProps) {
    if (!skill) return null

    // Normalize skill name to match filename (e.g., 'Camping' -> 'camping')
    const skillId = skill.toLowerCase()
    const imagePath = `/images/adventure_skills/${skillId}.jpg`

    return (
        <div className={cn("inline-flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all", className)}>
            <div className="relative h-6 w-6 overflow-hidden rounded-full border border-blue-100 bg-white shrink-0">
                <img
                    src={imagePath}
                    alt={`${skill} Badge`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.style.backgroundColor = '#e2e8f0' // bg-slate-200
                    }}
                />
            </div>
            {showLabel && (
                <span className="text-sm font-semibold capitalize whitespace-nowrap">
                    {skill}
                </span>
            )}
        </div>
    )
}
