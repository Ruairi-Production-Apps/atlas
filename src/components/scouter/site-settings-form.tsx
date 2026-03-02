'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { OrgImageUpload } from './org-image-upload'
import { updateSiteSettings } from '@/app/scouter/site-settings/actions'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Globe, ShieldCheck } from 'lucide-react'
import { SiteSettings } from '@/lib/supabase/queries'

interface SiteSettingsFormProps {
    settings: SiteSettings
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        site_title: settings.site_title || '',
        logo_url: settings.logo_url,
        primary_color: settings.primary_color || '#005596',
        sync_enabled: settings.sync_enabled
    })
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateSiteSettings(settings.id, formData)
            toast({ title: "Settings saved", description: "Site branding and ecosystem settings updated." })
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Site Branding</CardTitle>
                    <CardDescription>
                        Customize how your Atlas instance appears to visitors.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="site_title">Site Title</Label>
                        <Input
                            id="site_title"
                            placeholder="e.g. 1st Dublin Scouts"
                            value={formData.site_title}
                            onChange={(e) => setFormData(prev => ({ ...prev, site_title: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">This appears in the browser tab and header.</p>
                    </div>

                    <OrgImageUpload
                        organizationId={settings.scope_id}
                        currentImageUrl={formData.logo_url}
                        onImageUpdate={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                        label="Site Logo"
                        aspectRatio="square"
                    />

                    <div className="grid gap-2">
                        <Label htmlFor="primary_color">Primary Color</Label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="color"
                                id="primary_color"
                                value={formData.primary_color?.startsWith('#') ? formData.primary_color : '#005596'}
                                onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                className="h-10 w-20 border border-input rounded-md cursor-pointer"
                            />
                            <Input
                                value={formData.primary_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                className="font-mono"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">This color will be used for buttons, links, and accents site-wide.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <CardTitle>Ecosystem Synchronization</CardTitle>
                    </div>
                    <CardDescription>
                        Control how your data behaves within the Atlas ecosystem.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                        <div className="space-y-1">
                            <Label className="text-base">Sync to Atlas Hub</Label>
                            <p className="text-sm text-muted-foreground max-w-md">
                                When enabled, your organization will be listed in the central directory and your public news and events will be synced to the Hub.
                            </p>
                        </div>
                        <Switch
                            checked={formData.sync_enabled}
                            onCheckedChange={(val) => setFormData(prev => ({ ...prev, sync_enabled: val }))}
                        />
                    </div>

                    <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-md text-xs text-amber-800 dark:text-amber-300">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <p>
                            <strong>Data Isolation Notice:</strong> Even with synchronization enabled, your private member data,
                            financial records, and internal communications are NEVER sent to the Hub.
                            Only public directory info, news, and events are shared.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="bg-blue-50/50 dark:bg-blue-900/20 rounded-b-lg border-t border-blue-100 dark:border-blue-800">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save All Settings
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
