'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { OrgImageUpload } from './org-image-upload'
import { updateSiteSettings } from '@/app/scouter/site-settings/actions'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface SiteSettingsFormProps {
    group: {
        id: string
        name: string
        site_title: string | null
        logo_url: string | null
        primary_color: string | null
    }
}

export function SiteSettingsForm({ group }: SiteSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: group.name,
        site_title: group.site_title || '',
        logo_url: group.logo_url,
        primary_color: group.primary_color || '#135 40% 30%' // Default fallback
    })
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateSiteSettings(group.id, formData)
            toast({ title: "Settings saved", description: "Site branding has been updated." })
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

                    <div className="grid gap-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. 1st Dublin (Custom)"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <OrgImageUpload
                        organizationId={group.id}
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
                <CardFooter>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Branding Settings
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
