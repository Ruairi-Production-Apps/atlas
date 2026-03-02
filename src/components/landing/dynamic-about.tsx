'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Building2 } from "lucide-react"

interface DynamicAboutProps {
    content: string
    name: string
}

export function DynamicAbout({ content, name }: DynamicAboutProps) {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <Building2 className="h-4 w-4" />
                            About Our Organization
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight">
                            Scouting in {name}
                        </h2>
                        <div className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {content}
                        </div>
                    </div>
                    <Card className="overflow-hidden border-none shadow-2xl">
                        <CardContent className="p-0">
                            <img
                                src="/images/atlas/AtlasHomeImage.jpg"
                                alt="Scouting"
                                className="w-full h-auto object-cover aspect-video lg:aspect-square"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
