"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Save, CreditCard, AlertTriangle, ExternalLink, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentSettings {
    require_payment: boolean
    pricing_model: 'per_youth' | 'per_scouter' | 'per_participant' | 'per_group' | 'fixed_price' | 'free'
    price_youth: number | null
    price_scouter: number | null
    price_group: number | null
    price_fixed: number | null
    payment_notes: string
}

interface FormBuilderPaymentsProps {
    formId: string
    eventId: string
    organizationType: string
    organizationId: string
    initialSettings?: PaymentSettings
    onSettingsSaved?: () => void
}

export function FormBuilderPayments({
    formId,
    eventId,
    organizationType,
    organizationId,
    initialSettings,
    onSettingsSaved
}: FormBuilderPaymentsProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [stripeConnected, setStripeConnected] = useState(false)
    const [checkingStripe, setCheckingStripe] = useState(true)

    const [settings, setSettings] = useState<PaymentSettings>({
        require_payment: initialSettings?.require_payment || false,
        pricing_model: initialSettings?.pricing_model || 'per_youth',
        price_youth: initialSettings?.price_youth || null,
        price_scouter: initialSettings?.price_scouter || null,
        price_group: initialSettings?.price_group || null,
        price_fixed: initialSettings?.price_fixed || null,
        payment_notes: initialSettings?.payment_notes || ""
    })

    // Check Stripe connection status
    useEffect(() => {
        checkStripeStatus()
    }, [organizationType, organizationId])

    const checkStripeStatus = async () => {
        setCheckingStripe(true)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/stripe-status`
            )
            const data = await response.json()
            setStripeConnected(data.connected || false)
        } catch (error) {
            console.error('Stripe status check error:', error)
            setStripeConnected(false)
        } finally {
            setCheckingStripe(false)
        }
    }

    // Calculate example pricing
    const exampleCalculation = useMemo(() => {
        const { pricing_model, price_youth, price_scouter, price_group, price_fixed } = settings

        switch (pricing_model) {
            case 'per_youth':
                return price_youth
                    ? `€${price_youth} per youth member (e.g., 5 youth = €${(price_youth * 5).toFixed(2)})`
                    : 'Set price per youth member'

            case 'per_scouter':
                return price_scouter
                    ? `€${price_scouter} per scouter (e.g., 2 scouters = €${(price_scouter * 2).toFixed(2)})`
                    : 'Set price per scouter'

            case 'per_participant':
                if (price_youth && price_scouter) {
                    const example = (price_youth * 5) + (price_scouter * 2)
                    return `€${price_youth}/youth + €${price_scouter}/scouter (e.g., 5 youth + 2 scouters = €${example.toFixed(2)})`
                }
                return 'Set prices for youth and scouters'

            case 'per_group':
                return price_group
                    ? `€${price_group} per group registration`
                    : 'Set flat group price'

            case 'fixed_price':
                return price_fixed
                    ? `€${price_fixed} total (regardless of participants)`
                    : 'Set fixed price'

            case 'free':
                return 'No payment required'

            default:
                return ''
        }
    }, [settings])

    const handleSave = async () => {
        // Validation
        if (settings.require_payment && !stripeConnected) {
            toast({
                title: "Stripe not connected",
                description: "You must connect Stripe before requiring payment.",
                variant: "destructive"
            })
            return
        }

        if (settings.require_payment && settings.pricing_model !== 'free') {
            // Check that required prices are set
            const { pricing_model, price_youth, price_scouter, price_group, price_fixed } = settings

            if (pricing_model === 'per_youth' && !price_youth) {
                toast({
                    title: "Price required",
                    description: "Please set the price per youth member.",
                    variant: "destructive"
                })
                return
            }

            if (pricing_model === 'per_scouter' && !price_scouter) {
                toast({
                    title: "Price required",
                    description: "Please set the price per scouter.",
                    variant: "destructive"
                })
                return
            }

            if (pricing_model === 'per_participant' && (!price_youth || !price_scouter)) {
                toast({
                    title: "Prices required",
                    description: "Please set prices for both youth and scouters.",
                    variant: "destructive"
                })
                return
            }

            if (pricing_model === 'per_group' && !price_group) {
                toast({
                    title: "Price required",
                    description: "Please set the per-group price.",
                    variant: "destructive"
                })
                return
            }

            if (pricing_model === 'fixed_price' && !price_fixed) {
                toast({
                    title: "Price required",
                    description: "Please set the fixed price.",
                    variant: "destructive"
                })
                return
            }
        }

        setLoading(true)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}/payments`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings)
                }
            )

            if (!response.ok) {
                throw new Error('Failed to save payment settings')
            }

            toast({
                title: "Payment settings saved",
                description: "Form payment configuration has been updated."
            })

            onSettingsSaved?.()
        } catch (error) {
            console.error('Save payment settings error:', error)
            toast({
                title: "Error",
                description: "Failed to save payment settings. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Stripe Connection Warning */}
            {!checkingStripe && !stripeConnected && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Stripe Not Connected</AlertTitle>
                    <AlertDescription className="space-y-2">
                        <p>
                            This organization hasn't connected a Stripe account yet. Payment collection requires Stripe Connect.
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/admin/organizations/${organizationType}/${organizationId}/settings#stripe`}>
                                Connect Stripe <ExternalLink className="ml-2 h-3 w-3" />
                            </a>
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Payment Enablement */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Requirement
                    </CardTitle>
                    <CardDescription>
                        Control whether this form requires payment to submit
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="require_payment">Require payment to submit this form</Label>
                            <p className="text-xs text-muted-foreground">
                                When enabled, users must complete payment before their submission is accepted
                            </p>
                        </div>
                        <Switch
                            id="require_payment"
                            checked={settings.require_payment}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require_payment: checked }))}
                            disabled={!stripeConnected}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Pricing Model */}
            {settings.require_payment && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Model</CardTitle>
                            <CardDescription>
                                Choose how pricing is calculated for this form
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={settings.pricing_model}
                                onValueChange={(value) => setSettings(prev => ({
                                    ...prev,
                                    pricing_model: value as PaymentSettings['pricing_model']
                                }))}
                            >
                                <div className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value="per_youth" id="per_youth" />
                                    <div className="flex-1">
                                        <Label htmlFor="per_youth" className="font-normal">
                                            Per Youth Member
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Charge a fee for each youth member registered
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value="per_scouter" id="per_scouter" />
                                    <div className="flex-1">
                                        <Label htmlFor="per_scouter" className="font-normal">
                                            Per Scouter
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Charge a fee for each scouter/adult registered
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value="per_participant" id="per_participant" />
                                    <div className="flex-1">
                                        <Label htmlFor="per_participant" className="font-normal">
                                            Per Participant (Mixed)
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Different prices for youth and scouters
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value="per_group" id="per_group" />
                                    <div className="flex-1">
                                        <Label htmlFor="per_group" className="font-normal">
                                            Per Group (Flat Fee)
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Single flat rate per group registration
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value="fixed_price" id="fixed_price" />
                                    <div className="flex-1">
                                        <Label htmlFor="fixed_price" className="font-normal">
                                            Fixed Price
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Single amount regardless of participants
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value="free" id="free" />
                                    <div className="flex-1">
                                        <Label htmlFor="free" className="font-normal">
                                            Free (No Charge)
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Explicitly mark this as a free event
                                        </p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Pricing Fields */}
                    {settings.pricing_model !== 'free' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                                <CardDescription>
                                    Set your prices based on the selected pricing model
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(settings.pricing_model === 'per_youth' || settings.pricing_model === 'per_participant') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="price_youth">Price per Youth Member (€)</Label>
                                        <Input
                                            id="price_youth"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={settings.price_youth || ""}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                price_youth: e.target.value ? parseFloat(e.target.value) : null
                                            }))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}

                                {(settings.pricing_model === 'per_scouter' || settings.pricing_model === 'per_participant') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="price_scouter">Price per Scouter (€)</Label>
                                        <Input
                                            id="price_scouter"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={settings.price_scouter || ""}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                price_scouter: e.target.value ? parseFloat(e.target.value) : null
                                            }))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}

                                {settings.pricing_model === 'per_group' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="price_group">Price per Group (€)</Label>
                                        <Input
                                            id="price_group"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={settings.price_group || ""}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                price_group: e.target.value ? parseFloat(e.target.value) : null
                                            }))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}

                                {settings.pricing_model === 'fixed_price' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="price_fixed">Fixed Price (€)</Label>
                                        <Input
                                            id="price_fixed"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={settings.price_fixed || ""}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                price_fixed: e.target.value ? parseFloat(e.target.value) : null
                                            }))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="payment_notes">Admin Notes (Optional)</Label>
                                    <Textarea
                                        id="payment_notes"
                                        rows={3}
                                        value={settings.payment_notes}
                                        onChange={(e) => setSettings(prev => ({ ...prev, payment_notes: e.target.value }))}
                                        placeholder="Internal notes about payment (not shown to public)..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Private notes for organizers only
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Preview */}
                    {settings.pricing_model !== 'free' && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Pricing Example</AlertTitle>
                            <AlertDescription>
                                {exampleCalculation}
                            </AlertDescription>
                        </Alert>
                    )}
                </>
            )}

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
                            Save Payment Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
