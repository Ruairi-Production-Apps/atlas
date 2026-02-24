'use client'

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Slide {
    id: string
    image_url: string
    title?: string
    subtitle?: string
    overlay_opacity?: number
}

interface DynamicHeroProps {
    slides: Slide[]
}

export function DynamicHero({ slides }: DynamicHeroProps) {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (slides.length <= 1) return
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [slides.length])

    if (slides.length === 0) {
        return (
            <section className="relative h-[60vh] flex items-center justify-center bg-muted">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">Welcome</h1>
                </div>
            </section>
        )
    }

    const next = () => setCurrent((prev) => (prev + 1) % slides.length)
    const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

    return (
        <section className="relative h-[70vh] w-full overflow-hidden bg-black">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000",
                        index === current ? "opacity-100" : "opacity-0"
                    )}
                >
                    <img
                        src={slide.image_url}
                        alt={slide.title || "Slide"}
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: slide.overlay_opacity ?? 0.4 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                        <div className="max-w-4xl space-y-4 text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            {slide.title && (
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                                    {slide.title}
                                </h1>
                            )}
                            {slide.subtitle && (
                                <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium">
                                    {slide.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {slides.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 rounded-full"
                        onClick={prev}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 rounded-full"
                        onClick={next}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    i === current ? "bg-white w-4" : "bg-white/50"
                                )}
                                onClick={() => setCurrent(i)}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}
