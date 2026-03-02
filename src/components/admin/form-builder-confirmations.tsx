"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Mail, Bell, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ConfirmationSettings {
    confirmation_message: string
    send_confirmation_email: boolean
    send_admin_notification: boolean
    redirect_url: string
}

interface FormBuilderConfirmationsProps {
    formId: string
    eventId: string
    organizationType: string
    organizationId: string
    isProductForm: boolean
    initialSettings?: ConfirmationSettings
    onSettingsSaved?: () => void
}

export function FormBuilderConfirmations({
    formId,
    eventId,
    organizationType,
    organizationId,
    isProductForm,
    initialSettings,
    onSettingsSaved
}: FormBuilderConfirmationsProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const [settings, setSettings] = useState<ConfirmationSettings>({
        confirmation_message: initialSettings?.confirmation_message || "Thank you for your submission! We'll be in touch soon.",
        send_confirmation_email: initialSettings?.send_confirmation_email ?? true,
        send_admin_notification: initialSettings?.send_admin_notification ?? true,
        redirect_url: initialSettings?.redirect_url || ""
    })

    const [urlError, setUrlError] = useState("")

    const validateUrl = (url: string) => {
        if (!url) {
            setUrlError("")
            return true
        }

        try {
            new URL(url)
            setUrlError("")
            return true
        } catch {
            setUrlError("Please enter a valid URL (e.g., https://example.com)")
            return false
        }
    }

    const handleUrlChange = (url: string) => {
        setSettings(prev => ({ ...prev, redirect_url: url }))
        validateUrl(url)
    }

    const handleSave = async () => {
        // Validate URL if provided
        if (settings.redirect_url && !validateUrl(settings.redirect_url)) {
            return
        }

        setLoading(true)
        try {
            const basePath = isProductForm
                ? `/api/organizations/${organizationType}/${organizationId}/products/${eventId}/forms/${formId}`
                : `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}`

            const response = await fetch(
                `${basePath}/confirmations`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings)
                }
            )

            if (!response.ok) {
                throw new Error('Failed to save confirmation settings')
            }

            toast({
                title: "Confirmation settings saved",
                description: "Form confirmation configuration has been updated."
            })

            onSettingsSaved?.()
        } catch (error) {
            console.error('Save confirmation settings error:', error)
            toast({
                title: "Error",
                description: "Failed to save confirmation settings. Please try again.",
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
                    <CardTitle>Confirmation Message</CardTitle>
                    <CardDescription>
                        Message displayed to users after successful form submission
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="confirmation_message">Success Message</Label>
                        <Textarea
                            id="confirmation_message"
                            rows={5}
                            value={settings.confirmation_message}
                            onChange={(e) => setSettings(prev => ({ ...prev, confirmation_message: e.target.value }))}
                            placeholder="Thank you for your submission! We'll be in touch soon."
                        />
                        <p className="text-xs text-muted-foreground">
                            This message will be shown immediately after the form is submitted successfully
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                        Configure automatic emails sent after form submission
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="send_confirmation_email">Send Confirmation Email to Submitter</Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Automatically send a confirmation email to the person who submitted the form
                            </p>
                        </div>
                        <Switch
                            id="send_confirmation_email"
                            checked={settings.send_confirmation_email}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, send_confirmation_email: checked }))}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="send_admin_notification">Send Admin Notification</Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Notify organization administrators when someone submits this form
                            </p>
                        </div>
                        <Switch
                            id="send_admin_notification"
                            checked={settings.send_admin_notification}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, send_admin_notification: checked }))}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5" />
                        Redirect After Submission
                    </CardTitle>
                    <CardDescription>
                        Optionally redirect users to a specific page after form submission
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="redirect_url">Redirect URL (Optional)</Label>
                        <Input
                            id="redirect_url"
                            type="url"
                            value={settings.redirect_url}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            placeholder="https://example.com/thank-you"
                        />
                        {urlError && (
                            <p className="text-xs text-destructive">{urlError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            If provided, users will be redirected to this URL after submission instead of showing the confirmation message
                        </p>
                    </div>

                    <div className="p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">
                            <strong>Note:</strong> If a redirect URL is set, the confirmation message will not be displayed.
                            Users will be sent directly to the specified URL.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Receipts</CardTitle>
                    <CardDescription>
                        Stripe automatically sends payment receipts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-muted rounded-md space-y-2">
                        <p className="text-sm">
                            When payment is required, Stripe automatically sends a receipt email to the payer after successful payment.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            This is in addition to any confirmation email you configure above.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button onClick={handleSave} disabled={loading || !!urlError}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Confirmation Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
