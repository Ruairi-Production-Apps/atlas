import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAdventureTeamBySlug, getEventsForScope, getNewsPostsForScope } from "@/lib/supabase/queries"
import { Calendar, MapPin, Tag, ShoppingBag } from "lucide-react"
import { StoreGrid } from "@/components/store/store-grid"
import { CartSheet } from "@/components/store/cart-sheet"
import { OrganizationContactsList } from "@/components/organizations/organization-contacts-list"
import { RichTextContent } from "@/components/ui/rich-text-content"

export default async function TeamPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const team = await getAdventureTeamBySlug(slug)

    if (!team) {
        notFound()
    }

    const events = await getEventsForScope('adventure_team' as any, team.id)
    const newsPosts = await getNewsPostsForScope('adventure_team' as any, team.id)

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div className="flex items-start gap-6">
                        {team.logo_url && (
                            <img
                                src={team.logo_url}
                                alt={`${team.name} logo`}
                                className="w-24 h-24 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-4">{team.name}</h1>
                            {team.description && (
                                <p className="text-lg text-muted-foreground">{team.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Cart Trigger */}
                    <div className="ml-4">
                        <CartSheet scopeId={team.id} scopeType="adventure_team" />
                    </div>
                </div>

                {/* Contact Info */}
                {(team.email || team.website || team.facebook_url || team.instagram_url) && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {team.email && (
                                <p><strong>Email:</strong> <a href={`mailto:${team.email}`} className="text-primary hover:underline">{team.email}</a></p>
                            )}
                            {team.website && (
                                <p><strong>Website:</strong> <a href={team.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{team.website}</a></p>
                            )}
                            {team.facebook_url && (
                                <p><strong>Facebook:</strong> <a href={team.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visit Page</a></p>
                            )}
                            {team.instagram_url && (
                                <p><strong>Instagram:</strong> <a href={team.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visit Profile</a></p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <OrganizationContactsList organizationId={team.id} />

                {team.long_description && (
                    <RichTextContent content={team.long_description} className="mb-8" />
                )}

                {/* Tabs for News, Events, Store */}
                <Tabs defaultValue="news" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
                        <TabsTrigger
                            value="news"
                            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                        >
                            News
                        </TabsTrigger>
                        <TabsTrigger
                            value="events"
                            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                        >
                            Events
                        </TabsTrigger>
                        <TabsTrigger
                            value="store"
                            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                        >
                            Store
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="news" className="mt-6">
                        {newsPosts.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-muted-foreground">No news posts found.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {newsPosts.map((post) => (
                                    <Link key={post.id} href={`/news/${post.slug}`}>
                                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                            {post.featured_image_url && (
                                                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                                                    <img
                                                        src={post.featured_image_url}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                                <CardDescription>
                                                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-IE', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </CardDescription>
                                            </CardHeader>
                                            {(post.description || post.body) && (
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                                        {post.description || (post.body ? post.body.replace(/<[^>]*>/g, '').substring(0, 150) : '')}
                                                    </p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="events" className="mt-6">
                        {events.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-muted-foreground">No events found.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {events.map((event) => (
                                    <Link key={event.id} href={`/events/${event.slug}`}>
                                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                            {event.featured_image_url && (
                                                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                                                    <img
                                                        src={event.featured_image_url}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                                                <CardDescription className="flex items-center gap-4 mt-2">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(event.start_date).toLocaleDateString('en-IE', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                    {event.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {event.location}
                                                        </span>
                                                    )}
                                                </CardDescription>
                                            </CardHeader>
                                            {event.body && (
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                                        {event.body.replace(/<[^>]*>/g, '').substring(0, 150)}
                                                    </p>
                                                    {event.price && (
                                                        <p className="text-sm font-medium">
                                                            €{event.price.toFixed(2)}
                                                        </p>
                                                    )}
                                                </CardContent>
                                            )}
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="store" className="mt-6">
                        <StoreGrid scopeType="adventure_team" scopeId={team.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
