import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEvents, getProvinces, getCounties, getGroups, getSiteSettings, getNewsPostsForScope, getEventsForScope, getHomeOrgConfig } from "@/lib/supabase/queries";
import { EventsFilter } from "@/components/events/events-filter";
import { EventsView } from "@/components/events/events-view";
import { DynamicHero } from "@/components/landing/dynamic-hero";
import { DynamicAbout } from "@/components/landing/dynamic-about";
import { DynamicNews } from "@/components/landing/dynamic-news";
import { DynamicEvents } from "@/components/landing/dynamic-events";
import { isInstance, APP_CONFIG } from "@/lib/config/app-config";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string
    search?: string
    dateFrom?: string
    dateTo?: string
    provinceId?: string
    countyId?: string
    groupId?: string
    visibility?: string
    category?: string
    section?: string
  }>;
}) {
  const params = await searchParams;

  if (params.code) {
    redirect(`/auth/callback?code=${params.code}&next=/dashboard`);
  }

  // Handle Instance Mode vs Hub Mode
  const homeOrg = isInstance() ? await getHomeOrgConfig() : null;

  if (homeOrg) {
    const settings = await getSiteSettings(homeOrg.type, homeOrg.id);

    if (settings) {
      // Very robust config resolution
      const config = settings.homepage_config || {};
      const sections = {
        slider: { enabled: true, slides: [], ...config.sections?.slider },
        about: { enabled: true, content: "Welcome to our Atlas instance.", ...config.sections?.about },
        news: { enabled: true, ...config.sections?.news },
        events: { enabled: true, ...config.sections?.events }
      };

      const newsPosts = sections.news?.enabled ? await getNewsPostsForScope(homeOrg.type as any, homeOrg.id) : [];
      const upcomingEvents = sections.events?.enabled ? await getEventsForScope(homeOrg.type as any, homeOrg.id) : [];

      const hasSections = sections.slider?.enabled || sections.about?.enabled || sections.news?.enabled || sections.events?.enabled;

      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      let isSysadmin = false;
      if (user) {
        const { data: role } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', user.id)
          .eq('role', 'sysadmin')
          .single();
        isSysadmin = !!role;
      }

      return (
        <div className="flex flex-col w-full pb-20">
          {/* Admin Toolbar if applicable */}
          {isInstance() && isSysadmin && (
            <div className="bg-primary/10 border-b py-2">
              <div className="container mx-auto px-4 flex justify-between items-center">
                <span className="text-xs font-bold text-primary uppercase">Administrator Tools</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/scouter/site-settings">
                      Manage Site Settings
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {sections.slider?.enabled && (
            <div className="min-h-[400px]">
              <DynamicHero slides={sections.slider.slides || []} />
            </div>
          )}

          {sections.about?.enabled && (
            <DynamicAbout content={sections.about.content} name={settings.site_title || "Our Organization"} />
          )}

          {sections.news?.enabled && (
            <DynamicNews posts={newsPosts} orgSlug={homeOrg.id} />
          )}

          {sections.events?.enabled && (
            <DynamicEvents events={upcomingEvents} />
          )}

          {!hasSections && (
            <div className="container mx-auto py-20 text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to {settings.site_title || "Atlas"}</h1>
              <p className="text-muted-foreground">This site is ready for content. Check the dashboard to start editing your homepage.</p>
              <Button asChild className="mt-8">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          )}
        </div>
      )
    } else {
      // Settings record exists but something is wrong or it's not actually initialized
      return (
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to {homeOrg.site_title || "Atlas"}</h1>
          <p className="text-muted-foreground">Instance setup incomplete. Please visit the setup page if you haven't already.</p>
          <Button asChild className="mt-8">
            <Link href="/setup">Finish Setup</Link>
          </Button>
        </div>
      )
    }
  }

  // HUB MODE (Central Directory)
  // Fetch data for Events Calendar
  const filters = {
    search: params.search,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    provinceId: params.provinceId,
    countyId: params.countyId,
    groupId: params.groupId,
    visibility: params.visibility as 'open_to_all' | 'sections_only' | 'scouters_only' | undefined,
    category: params.category as 'youth_programme' | 'training' | 'national' | undefined,
    section: params.section,
  }

  const events = await getEvents(filters)
  const provinces = await getProvinces()
  const counties = params.provinceId ? await getCounties(params.provinceId) : []
  const groups = params.countyId ? await getGroups(params.countyId) : []

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-20">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Welcome to Atlas Hub
            </h1>
            <div className="mb-8">
              <img
                src="/images/atlas/AtlasLogo.png"
                alt="Atlas Logo"
                className="h-32 w-auto object-contain"
              />
            </div>
            <div className="text-lg text-foreground mb-8 space-y-4">
              <p>
                Atlas Hub is the central directory for Scouters in Ireland — a modern map for events, resources, and group discovery.
                Find news and activities from across all Provinces, Counties, and Groups.
              </p>
              <p className="font-semibold italic">
                Built for Scouters. Designed for adventure.
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/provinces">Explore Provinces</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/events">View Events</Link>
              </Button>
            </div>
          </div>
          <div className="relative w-full rounded-lg shadow-xl shrink-0">
            <img
              src="/images/atlas/AtlasHomeImage.jpg"
              alt="Scouting adventure"
              className="w-full h-auto rounded-lg object-contain"
            />
          </div>
        </div>
      </section>

      {/* Events Calendar Section */}
      <section className="py-16 bg-muted/30 rounded-lg px-8 mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src="/images/atlas/events-badge.png" alt="Events" className="h-12 w-12 object-contain" />
              <h2 className="text-3xl font-bold">Events Calendar</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Explore upcoming scouting events from across the country
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/events">View All Events</Link>
          </Button>
        </div>

        <Card className="mb-8 bg-background">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <EventsFilter
              provinces={provinces}
              counties={counties}
              groups={groups}
            />
          </CardContent>
        </Card>

        <EventsView events={events} defaultView="calendar" />
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Discover Scouting</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <img src="/images/atlas/province-badge.png" alt="Provinces" className="w-16 h-16 object-contain shrink-0" />
              <div>
                <CardTitle className="text-xl">Provinces</CardTitle>
                <CardDescription className="mt-2 text-foreground text-base">
                  Explore scouting provinces across Ireland
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/provinces">View Provinces →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <img src="/images/atlas/counties-badge.png" alt="Counties" className="w-16 h-16 object-contain shrink-0" />
              <div>
                <CardTitle className="text-xl">Counties</CardTitle>
                <CardDescription className="mt-2 text-foreground text-base">
                  Find scouting counties in your area
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/counties">View Counties →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <img src="/images/atlas/groups-badge.png" alt="Groups" className="w-16 h-16 object-contain shrink-0" />
              <div>
                <CardTitle className="text-xl">Groups</CardTitle>
                <CardDescription className="mt-2 text-foreground text-base">
                  Connect with local scouting groups
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/groups">View Groups →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <img src="/images/atlas/skills-teams-badges.png" alt="Adventure Skills Teams" className="w-16 h-16 object-contain shrink-0" />
              <div>
                <CardTitle className="text-xl">Adventure Skills Teams</CardTitle>
                <CardDescription className="mt-2 text-foreground text-base">
                  Discover expert teams for skills training
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/teams">View Teams →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <img src="/images/atlas/events-badge.png" alt="Events" className="w-16 h-16 object-contain shrink-0" />
              <div>
                <CardTitle className="text-xl">Events</CardTitle>
                <CardDescription className="mt-2 text-foreground text-base">
                  Discover upcoming scouting events country-wide
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/events">View Events →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <img src="/images/atlas/news-badge.png" alt="News" className="w-16 h-16 object-contain shrink-0" />
              <div>
                <CardTitle className="text-xl">News</CardTitle>
                <CardDescription className="mt-2 text-foreground text-base">
                  Stay updated with the latest scouting news
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/news">Read News →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center bg-muted rounded-lg mb-16 px-4">
        <h2 className="text-3xl font-bold mb-4">Get Involved</h2>
        <div className="text-lg text-foreground mb-8 max-w-2xl mx-auto space-y-4">
          <p>
            Atlas is a community-driven platform. Scouters can contribute news, events, and knowledgebase resources to help others across the country.
          </p>
          <p>
            Want to take Atlas to your own Group? Set up your own <strong>Atlas Standalone</strong> instance to manage your members and finances privately.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/standalone">Install Atlas Standalone</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/about">Get in Touch to Contribute</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
