import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { APP_CONFIG, isInstance } from '@/lib/config/app-config'
import { getSiteSettings } from '@/lib/supabase/queries'
import { SiteSettingsForm } from '@/components/scouter/site-settings-form'
import { HomepageEditor } from '@/components/scouter/homepage-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function SiteSettingsPage() {
    if (!isInstance() || !APP_CONFIG.homeOrgId || !APP_CONFIG.homeOrgType) {
        redirect('/dashboard')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const settings = await getSiteSettings(APP_CONFIG.homeOrgType, APP_CONFIG.homeOrgId)
    if (!settings) {
        // If no settings exist yet but we are in instance mode, something is wrong
        // but we'll redirect to setup just in case the middleware didn't catch it
        redirect('/setup')
    }

    // Check if user is an admin for this entity or sysadmin
    const { data: role } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('scope_id', APP_CONFIG.homeOrgId)
        .maybeSingle()

    const { data: sysRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'sysadmin')
        .maybeSingle()

    if (!role && !sysRole) {
        redirect('/dashboard')
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Site Customization</h1>
                <p className="text-muted-foreground">Manage your Atlas instance branding and synchronization.</p>
            </div>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList>
                    <TabsTrigger value="branding">Branding & Identity</TabsTrigger>
                    <TabsTrigger value="ecosystem">Ecosystem & Sync</TabsTrigger>
                    <TabsTrigger value="homepage">Homepage Editor</TabsTrigger>
                </TabsList>
                <TabsContent value="branding" className="pt-6">
                    <SiteSettingsForm settings={settings} />
                </TabsContent>
                <TabsContent value="ecosystem" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ecosystem Settings</CardTitle>
                            <CardDescription>Configure how your instance interacts with the Atlas Hub.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* We'll implement the toggle inside SiteSettingsForm or a separate component */}
                            <p className="text-sm text-muted-foreground mb-4">
                                Most ecosystem settings are managed in the Branding tab for convenience,
                                but more advanced options can be added here.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="homepage" className="pt-6">
                    <HomepageEditor settingsId={settings.id} currentConfig={settings.homepage_config} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("bg-card text-card-foreground rounded-lg border shadow-sm", className)}>{children}</div>
}
function CardHeader({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col space-y-1.5 p-6">{children}</div>
}
function CardTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>
}
function CardDescription({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-muted-foreground">{children}</p>
}
function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("p-6 pt-0", className)}>{children}</div>
}

import { cn } from '@/lib/utils'
