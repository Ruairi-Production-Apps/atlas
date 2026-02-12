import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Backpack, Calendar, MapPin, Building2, User } from 'lucide-react'
import { PrintButton } from '@/components/gear-lists/print-button'

interface PageProps {
    params: Promise<{
        token: string
    }>
}

export default async function PublicGearListPage({ params }: PageProps) {
    const { token } = await params
    const supabase = await createClient()

    // Fetch gear list via public API endpoint
    // Determine base URL - force localhost in development to avoid fetching from production
    const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : process.env.NEXT_PUBLIC_SITE_URL

    // Fetch gear list via public API endpoint
    const response = await fetch(
        `${baseUrl}/api/gear-lists/share/${token}`,
        { cache: 'no-store' }
    )

    if (!response.ok) {
        notFound()
    }

    const data = await response.json()
    const gearList = data.gearList

    // Group items by category
    const itemsByCategory = gearList.items_by_category || {}
    const categories = Object.keys(itemsByCategory).sort()

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Header */}
            <div className="bg-primary text-primary-foreground py-8 print:py-4">
                <div className="container max-w-4xl mx-auto px-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Backpack className="h-8 w-8" />
                                <h1 className="text-3xl font-bold tracking-tight print:text-2xl">
                                    {gearList.title}
                                </h1>
                            </div>
                            {gearList.description && (
                                <p className="text-primary-foreground/90 text-lg">
                                    {gearList.description}
                                </p>
                            )}
                        </div>
                        <PrintButton />
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="container max-w-4xl mx-auto px-4 py-6 print:py-3">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {gearList.organization_name && (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{gearList.organization_name}</span>
                        </div>
                    )}
                    {gearList.event && gearList.event.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{Array.isArray(gearList.event) ? gearList.event[0].title : gearList.event.title}</span>
                        </div>
                    )}
                    {gearList.author && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                                Created by {gearList.author.first_name} {gearList.author.last_name}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Items List */}
            <div className="container max-w-4xl mx-auto px-4 pb-12 print:pb-6">
                <div className="space-y-6">
                    {(!gearList.items || gearList.items.length === 0) ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <Backpack className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No items in this gear list yet.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="print:break-inside-avoid">
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    {gearList.items.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start justify-between py-2 border-b last:border-0"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {item.item_name}
                                                    </span>
                                                    {item.quantity > 1 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            × {item.quantity}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {item.notes && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-4 print:hidden">
                                                <input
                                                    type="checkbox"
                                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                    aria-label={`Check off ${item.item_name}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground print:mt-6">
                    <p>
                        This gear list was created using Scout Hub.{' '}
                        <span className="print:hidden">
                            Share this link with others to help them prepare.
                        </span>
                    </p>
                </div>
            </div>

            {/* Print Styles moved to globals.css */}
        </div>
    )
}

export async function generateMetadata({ params }: PageProps) {
    const { token } = await params

    try {
        const baseUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : process.env.NEXT_PUBLIC_SITE_URL

        const response = await fetch(
            `${baseUrl}/api/gear-lists/share/${token}`,
            { cache: 'no-store' }
        )

        if (response.ok) {
            const data = await response.json()
            const gearList = data.gearList

            return {
                title: `${gearList.title} - Gear List | Scout Hub`,
                description: gearList.description || `Packing list for ${gearList.title}`,
            }
        }
    } catch (error) {
        console.error('Error generating metadata:', error)
    }

    return {
        title: 'Gear List | Scout Hub',
        description: 'View packing list for your scouting event',
    }
}
