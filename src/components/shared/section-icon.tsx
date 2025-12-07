import Image from 'next/image'
import { cn } from '@/lib/utils'

const SECTION_LOGOS: Record<string, string> = {
    beavers: '/images/scouting_ireland/Beavers Logo.png',
    cubs: '/images/scouting_ireland/Cubs Logo.png',
    scouts: '/images/scouting_ireland/Scouts Logo.png',
    ventures: '/images/scouting_ireland/Ventures Logo.png',
    rovers: '/images/scouting_ireland/Rovers Logo.png',
}

interface SectionIconProps {
    section: string
    size?: number
    className?: string
}

export function SectionIcon({ section, size = 24, className }: SectionIconProps) {
    const sectionKey = section.toLowerCase()
    const src = SECTION_LOGOS[sectionKey]

    if (!src) return null

    return (
        <div className={cn("relative flex items-center justify-center shrink-0", className)} style={{ width: size, height: size }}>
            <Image
                src={src}
                alt={`${section} Logo`}
                fill
                className="object-contain"
                sizes={`${size}px`}
            />
        </div>
    )
}
