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
            <div className="text-lg text-muted-foreground mb-8 space-y-4">
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
            <CardHeader>
              <CardTitle>Provinces</CardTitle>
              <CardDescription>
                Explore scouting provinces across Ireland
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/provinces">View Provinces →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Counties</CardTitle>
              <CardDescription>
                Find scouting counties in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/counties">View Counties →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Groups</CardTitle>
              <CardDescription>
                Connect with local scouting groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/groups">View Groups →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>
                Discover upcoming scouting events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/events">View Events →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>News</CardTitle>
              <CardDescription>
                Stay updated with the latest scouting news
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/news">Read News →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Knowledgebase</CardTitle>
              <CardDescription>
                Access resources and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/knowledgebase">Browse KB →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center bg-muted rounded-lg mb-16">
        <h2 className="text-3xl font-bold mb-4">Join Atlas</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create an account to manage your scouting activities, register for events, and more
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </section>
    </div>
  );
}
