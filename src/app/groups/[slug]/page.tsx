import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getGroupBySlug, getSections, getEventsForScope, getNewsPostsForScope } from "@/lib/supabase/queries"
import { Calendar, MapPin, ShoppingBag } from "lucide-react"
import { StoreGrid } from "@/components/store/store-grid"
import { CartSheet } from "@/components/store/cart-sheet"

export default async function GroupPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const group = await getGroupBySlug(slug)

    if (!group) {
        notFound()
    }

    const sections = await getSections(group.id)
    const events = await getEventsForScope('group', group.id)
    const newsPosts = await getNewsPostsForScope('group', group.id)

    // Format section type for display
    const formatSectionType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1)
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div className="flex items-start gap-6">
                        {group.logo_url && (
                            <img
                                src={group.logo_url}
                                alt={`${group.name} logo`}
                                className="w-24 h-24 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-4">{group.name}</h1>
                            {group.description && (
                                <p className="text-lg text-muted-foreground">{group.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Cart Trigger */}
                    <div className="ml-4">
                        <CartSheet scopeId={group.id} scopeType="group" />
                    </div>
                </div>

                {/* Contact Info */}
                {(group.email || group.website || group.facebook_url || group.instagram_url) && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {group.email && (
                                <p><strong>Email:</strong> <a href={`mailto:${group.email}`} className="text-primary hover:underline">{group.email}</a></p>
                            )}
                            {group.website && (
                                <p><strong>Website:</strong> <a href={group.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{group.website}</a></p>
                            )}
                            {group.facebook_url && (
                                <p><strong>Facebook:</strong> <a href={group.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visit Page</a></p>
                            )}
                            {group.instagram_url && (
                                <p><strong>Instagram:</strong> <a href={group.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visit Profile</a></p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tabs for Info, News, Events, Store */}
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="info">Info</TabsTrigger>
                        <TabsTrigger value="news">News</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="store">Store</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Sections in {group.name}</h2>
                            {sections.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <p className="text-muted-foreground">No sections found in this group.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sections.map((section) => (
                                        <Card key={section.id}>
                                            <CardHeader>
                                                <CardTitle>{section.name}</CardTitle>
                                                <CardDescription>
                                                    {formatSectionType(section.section_type)}
                                                </CardDescription>
                                            </CardHeader>
                                            {section.description && (
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground">{section.description}</p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

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
                                                {post.published_at && (
                                                    <CardDescription>
                                                        {new Date(post.published_at).toLocaleDateString('en-IE', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </CardDescription>
                                                )}
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
                        <StoreGrid scopeType="group" scopeId={group.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
