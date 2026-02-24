import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getGroupById } from '@/lib/supabase/queries'
import { SiteSettingsForm } from '@/components/scouter/site-settings-form'
import { HomepageEditor } from '@/components/scouter/homepage-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function SiteSettingsPage() {
    const isInstance = process.env.NEXT_PUBLIC_APP_ROLE === 'instance'
    const homeOrgId = process.env.NEXT_PUBLIC_HOME_ORG_ID

    if (!isInstance || !homeOrgId) {
        redirect('/dashboard')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const group = await getGroupById(homeOrgId)
    if (!group) {
        redirect('/dashboard')
    }

    // Check if user is an admin for this group
    const { data: role } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('scope_id', homeOrgId)
        .single()

    const isSysAdmin = (await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'sysadmin').single()).data

    if (!role && !isSysAdmin) {
        redirect('/dashboard')
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Site Customization</h1>
                <p className="text-muted-foreground">Manage your Atlas instance branding and homepage layout.</p>
            </div>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList>
                    <TabsTrigger value="branding">Branding & Identity</TabsTrigger>
                    <TabsTrigger value="homepage">Homepage Editor</TabsTrigger>
                </TabsList>
                <TabsContent value="branding" className="pt-6">
                    <SiteSettingsForm group={group} />
                </TabsContent>
                <TabsContent value="homepage" className="pt-6">
                    <HomepageEditor groupId={group.id} currentConfig={group.homepage_config} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
