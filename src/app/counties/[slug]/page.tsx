import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCountyBySlug, getGroups, getEventsForScope, getNewsPostsForScope } from "@/lib/supabase/queries"
import { Calendar, MapPin, ShoppingBag } from "lucide-react"
import { StoreGrid } from "@/components/store/store-grid"
import { CartSheet } from "@/components/store/cart-sheet"
import { OrganizationContactsList } from "@/components/organizations/organization-contacts-list"
import { RichTextContent } from "@/components/ui/rich-text-content"
import { OrganizationKnowledgebaseTab } from "@/components/organizations/organization-knowledgebase-tab"

export default async function CountyPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const county = await getCountyBySlug(slug)

    if (!county) {
        notFound()
    }

    const groups = await getGroups(county.id)
    const events = await getEventsForScope('county', county.id)
    const newsPosts = await getNewsPostsForScope('county', county.id)

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div className="flex items-start gap-6">
                        {county.logo_url && (
                            <img
                                src={county.logo_url}
                                alt={`${county.name} logo`}
                                className="w-24 h-24 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-4">{county.name}</h1>
                            {county.description && (
                                <p className="text-lg text-muted-foreground">{county.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Cart Trigger */}
                    <div className="ml-4">
                        <CartSheet scopeId={county.id} scopeType="county" />
                    </div>
                </div>

                {/* Contact Info */}
                {(county.email || county.website || county.facebook_url || county.instagram_url) && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {county.email && (
                                <p><strong>Email:</strong> <a href={`mailto:${county.email}`} className="text-primary hover:underline">{county.email}</a></p>
                            )}
                            {county.website && (
                                <p><strong>Website:</strong> <a href={county.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{county.website}</a></p>
                            )}
                            {county.facebook_url && (
                                <p><strong>Facebook:</strong> <a href={county.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visit Page</a></p>
                            )}
                            {county.instagram_url && (
                                <p><strong>Instagram:</strong> <a href={county.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visit Profile</a></p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <OrganizationContactsList organizationId={county.id} />

                {county.long_description && (
                    <RichTextContent content={county.long_description} className="mb-8" />
                )}

                {/* Tabs for Groups, News, Events */}
                <Tabs defaultValue="groups" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 h-auto overflow-hidden bg-muted/50 p-1 rounded-lg">
                        <TabsTrigger value="groups">Groups</TabsTrigger>
                        <TabsTrigger value="news">News</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="knowledgebase">Knowledgebase</TabsTrigger>
                        <TabsTrigger value="store">Store</TabsTrigger>
                    </TabsList>

                    <TabsContent value="groups" className="mt-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Groups in {county.name}</h2>
                            {groups.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <p className="text-muted-foreground">No groups found in this county.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {groups.map((group) => (
                                        <Link key={group.id} href={`/groups/${group.slug}`}>
                                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                                <CardHeader>
                                                    <div className="flex items-start gap-4">
                                                        {group.logo_url && (
                                                            <img
                                                                src={group.logo_url}
                                                                alt={`${group.name} logo`}
                                                                className="w-16 h-16 object-contain border border-input rounded-md bg-muted p-2 shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <CardTitle>{group.name}</CardTitle>
                                                            {group.description && (
                                                                <CardDescription className="line-clamp-2">
                                                                    {group.description}
                                                                </CardDescription>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        </Link>
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

                    <TabsContent value="knowledgebase" className="mt-6">
                        <OrganizationKnowledgebaseTab scopeType="county" scopeId={county.id} />
                    </TabsContent>

                    <TabsContent value="store" className="mt-6">
                        <StoreGrid scopeType="county" scopeId={county.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
