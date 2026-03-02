"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FormSettingsProps {
    formId: string
    eventId: string
    organizationType: string
    organizationId: string
    initialSettings?: {
        title: string
        description: string
        button_text: string
        capacity_override: number | null
        visibility_override: string | null
        published: boolean
    }
    isProductForm: boolean
    onSettingsSaved?: () => void
}

export function FormBuilderSettings({
    formId,
    eventId,
    organizationType,
    organizationId,
    isProductForm,
    initialSettings,
    onSettingsSaved
}: FormSettingsProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        title: initialSettings?.title || "",
        description: initialSettings?.description || "",
        button_text: initialSettings?.button_text || "Submit",
        capacity_override: initialSettings?.capacity_override || null,
        visibility_override: initialSettings?.visibility_override || null,
        published: initialSettings?.published || false
    })

    const handleSave = async () => {
        setLoading(true)
        try {
            const basePath = isProductForm
                ? `/api/organizations/${organizationType}/${organizationId}/products/${eventId}/forms/${formId}`
                : `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}`

            const response = await fetch(
                `${basePath}/settings`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings)
                }
            )

            if (!response.ok) {
                throw new Error('Failed to save settings')
            }

            toast({
                title: "Settings saved",
                description: "Form settings have been updated successfully."
            })

            onSettingsSaved?.()
        } catch (error) {
            console.error('Save settings error:', error)
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Form Information</CardTitle>
                    <CardDescription>
                        Basic details about this registration form
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Form Title</Label>
                        <Input
                            id="title"
                            value={settings.title}
                            onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Event Registration, Medical Information"
                        />
                        <p className="text-xs text-muted-foreground">
                            This title appears at the top of the form
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Form Description</Label>
                        <Textarea
                            id="description"
                            rows={4}
                            value={settings.description}
                            onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Instructions or information about this form..."
                        />
                        <p className="text-xs text-muted-foreground">
                            Provide instructions or additional context for people filling out the form
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="button_text">Submit Button Text</Label>
                        <Input
                            id="button_text"
                            value={settings.button_text}
                            onChange={(e) => setSettings(prev => ({ ...prev, button_text: e.target.value }))}
                            placeholder="Submit"
                        />
                        <p className="text-xs text-muted-foreground">
                            Customize the text on the submit button (default: "Submit")
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Capacity Override</CardTitle>
                    <CardDescription>
                        Override the event's capacity for this specific form
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="capacity_override">Maximum Submissions (Optional)</Label>
                        <Input
                            id="capacity_override"
                            type="number"
                            min="0"
                            value={settings.capacity_override || ""}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                capacity_override: e.target.value ? parseInt(e.target.value) : null
                            }))}
                            placeholder="Leave empty to use event capacity"
                        />
                        <p className="text-xs text-muted-foreground">
                            Set a specific limit for this form. If left empty, the event's capacity will be used.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Visibility Override</CardTitle>
                    <CardDescription>
                        Override who can access this form
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="visibility_override">Form Visibility</Label>
                        <Select
                            value={settings.visibility_override || "default"}
                            onValueChange={(value) => setSettings(prev => ({
                                ...prev,
                                visibility_override: value === "default" ? null : value
                            }))}
                        >
                            <SelectTrigger id="visibility_override">
                                <SelectValue placeholder="Use event visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Use Event Visibility</SelectItem>
                                <SelectItem value="open_to_all">Open to All</SelectItem>
                                <SelectItem value="sections_only">Youth Members Only</SelectItem>
                                <SelectItem value="adults_only">Adults Only</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Override the event's visibility settings for this specific form
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Publishing</CardTitle>
                    <CardDescription>
                        Control whether this form is active and accepting submissions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="published">Published</Label>
                            <p className="text-xs text-muted-foreground">
                                When published, this form will be available for submissions
                            </p>
                        </div>
                        <Switch
                            id="published"
                            checked={settings.published}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, published: checked }))}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
