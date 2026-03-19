import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, FileText, ClipboardList, Shield } from "lucide-react"
import { isInstance, APP_CONFIG } from "@/lib/config/app-config"
import { getSiteSettings } from "@/lib/supabase/queries"
import { InstanceAbout } from "./instance-about"

export default async function AboutPage() {
    // Instance mode: show editable rich text content
    if (isInstance() && APP_CONFIG.homeOrgId && APP_CONFIG.homeOrgType) {
        const settings = await getSiteSettings(APP_CONFIG.homeOrgType, APP_CONFIG.homeOrgId)
        return (
            <InstanceAbout
                settingsId={settings?.id || ''}
                content={settings?.about_page_content || ''}
                siteTitle={settings?.site_title || 'Our Organization'}
            />
        )
    }

    // Hub mode: show default Atlas platform info
    return (
        <div className="container mx-auto px-4 py-24 max-w-5xl">
            {/* Header / Intro */}
            <div className="text-center mb-24 space-y-6">
                <div className="flex justify-center mb-6">
                    <img src="/images/atlas/AtlasLogo.png" alt="Atlas Logo" className="h-24 object-contain" />
                </div>
                <h1 className="text-5xl font-bold tracking-tight">About Atlas</h1>
                <div className="max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>
                        Atlas is a community-built platform designed to support Scouters across Ireland.
                        Its goal is simple: make it easier for Provinces, Counties, and Groups to organise, communicate, and deliver great Scouting experiences.
                    </p>
                    <p>
                        Today, Atlas serves as a national directory for Scouting organisations. Not every Province, County, or Group has been added yet, but Scouters are welcome to register and request their organisation to be included. Once added, each organisation receives its own dedicated page with tools to help manage its programme and share information with its members.
                    </p>
                </div>
            </div>

            {/* What Organisations Can Do */}
            <div className="mb-32">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">What Organisations Can Do on Atlas</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Every registered Province, County, and Group receives a suite of tools.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Public Profile */}
                    <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                        <CardHeader className="space-y-4">
                            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-50">
                                <span className="text-3xl">🗺️</span>
                            </div>
                            <CardTitle className="text-xl">A Public Profile Page</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                Showcase your organisation with a description, photos, and key details.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Key Contacts */}
                    <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                        <CardHeader className="space-y-4">
                            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-green-50">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-xl">Key Contacts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                Add your leadership team so visiting Scouters know who to reach out to.
                            </p>
                        </CardContent>
                    </Card>

                    {/* News */}
                    <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                        <CardHeader className="space-y-4">
                            <img src="/images/atlas/news-badge.png" alt="News" className="h-12 w-12 object-contain" />
                            <CardTitle className="text-xl">News & Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                Share updates, achievements, notices, and important information.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Events */}
                    <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                        <CardHeader className="space-y-4">
                            <img src="/images/atlas/events-badge.png" alt="Events" className="h-12 w-12 object-contain" />
                            <CardTitle className="text-xl">Events Calendar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                Publish upcoming events that automatically appear on the national Atlas calendar.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Store */}
                    <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                        <CardHeader className="space-y-4">
                            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-orange-50">
                                <CreditCard className="h-6 w-6 text-orange-600" />
                            </div>
                            <CardTitle className="text-xl">Store & Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                Sell products or accept payments and donations directly through your page.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Knowledge Base */}
                    <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                        <CardHeader className="space-y-4">
                            <img src="/images/atlas/knowledgebase-badge.png" alt="Knowledgebase" className="h-12 w-12 object-contain" />
                            <CardTitle className="text-xl">Knowledge Base</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                Create and publish articles, resources, and guidance specific to your organisation.
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <p className="text-center mt-16 text-muted-foreground font-medium text-lg text-pretty max-w-4xl mx-auto">
                    Users can browse news, events, and Scouting resources from across the country, helping Scouters stay connected and informed.
                </p>
            </div>

            {/* What's Coming Next */}
            <div className="mb-32">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">What’s Coming Next</h2>
                    <p className="text-muted-foreground text-lg">Atlas is actively growing. Planned features include:</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <FileText className="h-7 w-7" />
                            <h3 className="text-2xl font-semibold">Custom Forms</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">Organisations will be able to create their own forms for:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2 leading-relaxed">
                            <li>Event expressions of interest</li>
                            <li>Direct event registrations</li>
                            <li>Optional paid registrations</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <ClipboardList className="h-7 w-7" />
                            <h3 className="text-2xl font-semibold">Registration Dashboard</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Scouters will be able to register for events across Ireland.
                            Organisation admins will then be able to view, filter, and manage all submissions in one place.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Shield className="h-7 w-7" />
                            <h3 className="text-2xl font-semibold">Role-Based Permissions</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Invite team members and assign specific permissions like "Store Manager" or "Knowledge Base Editor" to manage content safely and efficiently.
                        </p>
                    </div>
                </div>
            </div>

            {/* Free Forever */}
            <div className="bg-muted/50 rounded-2xl p-8 md:p-16 text-center mb-32">
                <h2 className="text-3xl font-bold mb-6">Free Forever — Powered by the Scouting Community</h2>
                <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground text-lg leading-relaxed">
                    <p>
                        Atlas is free to use, and we intend to keep it that way.
                        To cover hosting and development costs, we welcome voluntary contributions from Provinces and Counties that find the platform useful.
                    </p>
                    <p>
                        Atlas exists because of Scouters.
                        If there is a tool, feature, or improvement that would help your Group, County, or Province, you’re encouraged to submit a feature request.
                        We’ll add it to the roadmap and prioritise based on community need.
                    </p>
                </div>
            </div>

            {/* Footer Tagline */}
            <div className="text-center space-y-2">
                <p className="text-3xl font-black text-primary">Built for Scouters.</p>
                <p className="text-3xl font-black text-primary/80">Designed for Adventure.</p>
            </div>
        </div>
    )
}
