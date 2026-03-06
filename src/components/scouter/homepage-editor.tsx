'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { OrgImageUpload } from './org-image-upload'
import { updateHomepageConfig } from '@/app/(main)/scouter/site-settings/actions'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Trash2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slide {
    id: string
    image_url: string
    title?: string
    subtitle?: string
    overlay_opacity?: number
}

interface HomepageConfig {
    sections: {
        slider: { enabled: boolean; slides: Slide[] }
        about: { enabled: boolean; content: string }
        news: { enabled: boolean }
        events: { enabled: boolean }
    }
}

interface HomepageEditorProps {
    settingsId: string
    currentConfig: HomepageConfig | null
}

export function HomepageEditor({ settingsId, currentConfig }: HomepageEditorProps) {
    const defaultConfig: HomepageConfig = {
        sections: {
            slider: { enabled: true, slides: [] },
            about: { enabled: true, content: "Welcome to our Atlas instance." },
            news: { enabled: true },
            events: { enabled: true }
        }
    }

    const [loading, setLoading] = useState(false)
    const [config, setConfig] = useState<HomepageConfig>(currentConfig || defaultConfig)
    const { toast } = useToast()

    const handleSave = async () => {
        setLoading(true)
        try {
            await updateHomepageConfig(settingsId, config)
            toast({ title: "Homepage updated", description: "Changes are now live." })
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message })
        } finally {
            setLoading(false)
        }
    }

    const addSlide = () => {
        const newSlide: Slide = {
            id: Math.random().toString(36).substring(7),
            image_url: '',
            title: '',
            subtitle: '',
            overlay_opacity: 0.4
        }
        setConfig(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                slider: {
                    ...prev.sections.slider,
                    slides: [...prev.sections.slider.slides, newSlide]
                }
            }
        }))
    }

    const removeSlide = (id: string) => {
        setConfig(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                slider: {
                    ...prev.sections.slider,
                    slides: prev.sections.slider.slides.filter(s => s.id !== id)
                }
            }
        }))
    }

    const updateSlide = (id: string, updates: Partial<Slide>) => {
        setConfig(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                slider: {
                    ...prev.sections.slider,
                    slides: prev.sections.slider.slides.map(s => s.id === id ? { ...s, ...updates } : s)
                }
            }
        }))
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Homepage Layout</CardTitle>
                    <CardDescription>
                        Toggle and customize sections on your instance landing page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="sections" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="sections">Sections Visibility</TabsTrigger>
                            <TabsTrigger value="content">Section Content</TabsTrigger>
                        </TabsList>

                        <TabsContent value="sections" className="space-y-4 pt-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Hero Slider</Label>
                                    <p className="text-sm text-muted-foreground">Large featured images at the top of the page.</p>
                                </div>
                                <Switch
                                    checked={config.sections.slider.enabled}
                                    onCheckedChange={(val) => setConfig(prev => ({ ...prev, sections: { ...prev.sections, slider: { ...prev.sections.slider, enabled: val } } }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">About Section</Label>
                                    <p className="text-sm text-muted-foreground">A brief description of your organization.</p>
                                </div>
                                <Switch
                                    checked={config.sections.about.enabled}
                                    onCheckedChange={(val) => setConfig(prev => ({ ...prev, sections: { ...prev.sections, about: { ...prev.sections.about, enabled: val } } }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Latest News</Label>
                                    <p className="text-sm text-muted-foreground">Automatically displays your most recent news posts.</p>
                                </div>
                                <Switch
                                    checked={config.sections.news.enabled}
                                    onCheckedChange={(val) => setConfig(prev => ({ ...prev, sections: { ...prev.sections, news: { enabled: val } } }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Upcoming Events</Label>
                                    <p className="text-sm text-muted-foreground">Automatically displays upcoming activities. (Calendar link included)</p>
                                </div>
                                <Switch
                                    checked={config.sections.events.enabled}
                                    onCheckedChange={(val) => setConfig(prev => ({ ...prev, sections: { ...prev.sections, events: { enabled: val } } }))}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-8 pt-4">
                            {/* Slider Editor */}
                            <div className={cn("space-y-4", !config.sections.slider.enabled && "opacity-50 grayscale")}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Hero Slides</h3>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={addSlide}
                                        disabled={!config.sections.slider.enabled}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Slide
                                    </Button>
                                </div>

                                {config.sections.slider.slides.length === 0 && (
                                    <div className="text-center p-8 border border-dashed rounded-lg bg-muted/50">
                                        <p className="text-muted-foreground">No slides configured. Add one to get started.</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {config.sections.slider.slides.map((slide, index) => (
                                        <div key={slide.id} className="p-4 border rounded-lg bg-card relative">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="grid gap-1.5">
                                                        <Label>Slide Title</Label>
                                                        <Input
                                                            value={slide.title}
                                                            onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                                                            placeholder="Main heading (optional)"
                                                        />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label>Subtitle</Label>
                                                        <Input
                                                            value={slide.subtitle}
                                                            onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                                                            placeholder="Smaller text below heading (optional)"
                                                        />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label>Image URL</Label>
                                                        <Input
                                                            value={slide.image_url}
                                                            onChange={(e) => updateSlide(slide.id, { image_url: e.target.value })}
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive h-8 w-8"
                                                    onClick={() => removeSlide(slide.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* About Editor */}
                            <div className={cn("space-y-4 border-t pt-8", !config.sections.about.enabled && "opacity-50 grayscale")}>
                                <h3 className="text-lg font-medium">About Organization</h3>
                                <div className="grid gap-1.5">
                                    <Label>Text Content</Label>
                                    <Textarea
                                        rows={6}
                                        value={config.sections.about.content}
                                        onChange={(e) => setConfig(prev => ({ ...prev, sections: { ...prev.sections, about: { ...prev.sections.about, content: e.target.value } } }))}
                                        placeholder="Describe your organization..."
                                        disabled={!config.sections.about.enabled}
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Info className="h-3 w-3" />
                                        This text will be displayed prominently on your landing page.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-6 bg-muted/50 rounded-b-lg">
                    <Button variant="outline" onClick={() => setConfig(currentConfig || defaultConfig)}>Reset Changes</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Homepage Config
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
