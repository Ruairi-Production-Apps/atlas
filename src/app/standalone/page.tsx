import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Share2, DollarSign, Database, Globe, Shield } from "lucide-react";

export default function AtlasStandalonePage() {
    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="bg-primary/5 py-20 border-b">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
                        Atlas Standalone
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
                        Take control of your Scouting organization with a private, self-hosted instance of Atlas.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" className="rounded-full px-8" asChild>
                            <Link href="#install">Install Atlas</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full px-8 border-primary text-primary hover:bg-primary/5" asChild>
                            <Link href="/about">Get in Touch</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Core Concepts */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">All-In-One Organisation Management</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                Atlas Standalone is a private, self-hosted instance of Atlas that allows you to manage your members, finances, news, and events on your own secure database.
                                It can be set up by any 'Organisation' in Scouting — Groups, Counties, Provinces, and Skill Teams.
                            </p>
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-slate-900">It provides:</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                                        <span className="text-muted-foreground">An <strong>Events Calendar</strong> for your members to browse upcoming events, with custom forms for registration and payments.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                                        <span className="text-muted-foreground">A <strong>News Section</strong> for your members to read the latest updates from your organization.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                                        <span className="text-muted-foreground">A <strong>Gear List</strong> for your members to see exactly what they need for adventures.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                                        <span className="text-muted-foreground">A <strong>Membership System</strong> for Groups to handle registration and fee payments securely.</span>
                                    </li>
                                </ul>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-primary/10 p-1 rounded">
                                        <Shield className="h-5 w-5 text-primary" />
                                    </div>
                                    <span><strong>Data Control:</strong> You own your data, which lives on a secure and private server in Dublin.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-primary/10 p-1 rounded">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                    </div>
                                    <span><strong>$0 Hosting:</strong> There are zero upfront or ongoing costs to running Atlas Standalone - except for your website address.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-primary/10 p-1 rounded">
                                        <Share2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <span><strong>Optional Interconnect:</strong> Any News, Events, or Resources you create can optionally be linked to <strong>Atlas Hub</strong> to share news and events nationwide.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-muted rounded-2xl p-8 aspect-video flex items-center justify-center border shadow-xl">
                            {/* Visual representation of Hub vs Instance */}
                            <div className="relative w-full h-full flex flex-col items-center justify-center">
                                <div className="z-10 bg-primary text-white p-6 rounded-2xl shadow-2xl mb-8 flex flex-col items-center">
                                    <Globe className="h-10 w-10 mb-2" />
                                    <span className="font-bold">Atlas Hub</span>
                                    <span className="text-xs opacity-75">Directory & Discovery</span>
                                </div>
                                <div className="flex gap-8">
                                    <div className="bg-background border p-4 rounded-xl shadow-lg flex flex-col items-center">
                                        <Server className="h-6 w-6 text-primary mb-1" />
                                        <span className="text-sm font-semibold whitespace-nowrap">My Group</span>
                                    </div>
                                    <div className="bg-background border p-4 rounded-xl shadow-lg flex flex-col items-center">
                                        <Server className="h-6 w-6 text-primary mb-1" />
                                        <span className="text-sm font-semibold whitespace-nowrap">My County</span>
                                    </div>
                                    <div className="bg-background border p-4 rounded-xl shadow-lg flex flex-col items-center">
                                        <Server className="h-6 w-6 text-primary mb-1" />
                                        <span className="text-sm font-semibold whitespace-nowrap">My Province</span>
                                    </div>
                                </div>
                                {/* Connecting Lines with Arrows */}
                                <svg className="absolute inset-0 w-full h-full -z-0 pointer-events-none overflow-visible">
                                    <defs>
                                        <marker
                                            id="arrowhead"
                                            markerWidth="10"
                                            markerHeight="7"
                                            refX="9"
                                            refY="3.5"
                                            orient="auto"
                                        >
                                            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-primary/40" />
                                        </marker>
                                    </defs>
                                    <path d="M 20% 65% L 50% 41%" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead)" className="text-primary/30" />
                                    <path d="M 50% 65% L 50% 41%" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead)" className="text-primary/30" />
                                    <path d="M 80% 65% L 50% 41%" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead)" className="text-primary/30" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Terminology</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <Card className="text-left border-primary/20">
                                <CardHeader>
                                    <CardTitle>Atlas (Standalone)</CardTitle>
                                    <CardDescription>The instance you install.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        The full-featured group management suite. Handles membership, payments,
                                        training records, gear lists, and secure communications.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="text-left">
                                <CardHeader>
                                    <CardTitle>Atlas Hub</CardTitle>
                                    <CardDescription>The master directory.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        This central site (AtlasHub.ie or similar) that aggregates public events
                                        and news from linked Atlas instances, acting as a national scouting directory.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="bg-primary text-primary-foreground rounded-3xl p-10 md:p-16">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl font-bold mb-6">How to Install</h2>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="bg-primary-foreground/20 h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Create Accounts</h3>
                                        <p className="opacity-90">Sign up for a free account on **Vercel** (for hosting) and **Supabase** (for your database).</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-primary-foreground/20 h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Deploy Repository</h3>
                                        <p className="opacity-90">Use our "Deploy to Vercel" button to clone the Atlas repo. Enter your database credentials in the environment variables.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-primary-foreground/20 h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Run Setup</h3>
                                        <p className="opacity-90">Visit your new site's `/setup` route to create your first admin user and configure your organization's details.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-8 bg-white/10 rounded-2xl border border-white/20">
                                <h3 className="text-2xl font-bold mb-4">Get Involved</h3>
                                <p className="mb-6 opacity-90">
                                    Not ready to host your own? You can still contribute! Get in touch if you want to help aggregate news, events, or resources for the Scouting community.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button size="lg" variant="secondary" className="rounded-full font-bold" id="install" asChild>
                                        <a href="https://github.com/Ruairi-Production-Apps/scout-hub-2026-next" target="_blank" rel="noopener noreferrer">View Source on GitHub</a>
                                    </Button>
                                    <Button size="lg" variant="outline" className="rounded-full font-bold border-white text-white hover:bg-white/10" asChild>
                                        <Link href="/about">Get in Touch</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
