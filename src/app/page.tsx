import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-20">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Welcome to Atlas
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
                Atlas is the central hub for Scouters— a modern map for events, resources, and group management.
                It allows Scouters to create, manage, and find news, events, and resources for Scouting in Ireland.
                It also includes a suite of tools to help manage Groups, Counties, Provinces, and Events.
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
          <div className="relative w-full md:w-1/2 rounded-lg shadow-xl">
            <img
              src="/images/atlas/AtlasHomeImage.jpg"
              alt="Scouting adventure"
              className="w-full h-auto rounded-lg object-contain"
            />
          </div>
        </div>
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
                  Discover upcoming scouting events
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

          <Card className="md:col-span-3 lg:col-span-1">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <img src="/images/atlas/knowledgebase-badge.png" alt="Knowledgebase" className="w-16 h-16 object-contain shrink-0" />
              <div>
                <CardTitle className="text-xl">Knowledgebase</CardTitle>
                <CardDescription className="mt-2 text-foreground text-base">
                  Access resources and documentation
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/knowledgebase">Browse KB →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center bg-muted rounded-lg mb-16">
        <h2 className="text-3xl font-bold mb-4">Join Atlas</h2>
        <p className="text-lg text-foreground mb-8 max-w-2xl mx-auto">
          Create an account to manage your scouting activities, register for events, and more
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </section>
    </div>
  );
}
