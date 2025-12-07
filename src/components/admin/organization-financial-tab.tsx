'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface OrganizationFinancialTabProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group'
    organizationName: string
}

export function OrganizationFinancialTab({
    organizationId,
    organizationType,
    organizationName,
}: OrganizationFinancialTabProps) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [validating, setValidating] = useState(false)
    const [showPrivateKey, setShowPrivateKey] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [validationStatus, setValidationStatus] = useState<{
        validated: boolean
        validatedAt: string | null
        error?: string
    }>({ validated: false, validatedAt: null })
    const [formData, setFormData] = useState({
        iban: '',
        bic: '',
        account_name: '',
        stripe_public_key: '',
        stripe_private_key: '',
        stripe_webhook_secret: '',
    })

    useEffect(() => {
        loadFinancialData()
    }, [organizationId, organizationType])

    const loadFinancialData = async () => {
        setLoading(true)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/financial`
            )
            if (!response.ok) throw new Error('Failed to load financial data')
            const data = await response.json()
            setFormData({
                iban: data.iban || '',
                bic: data.bic || '',
                account_name: data.account_name || '',
                stripe_public_key: data.stripe_public_key || '',
                stripe_private_key: data.stripe_private_key || '',
                stripe_webhook_secret: data.stripe_webhook_secret || '',
            })
            setValidationStatus({
                validated: data.stripe_keys_validated || false,
                validatedAt: data.stripe_keys_validated_at || null,
            })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to load financial data' })
        } finally {
            setLoading(false)
        }
    }

    const handleValidateStripeKeys = async () => {
        if (!formData.stripe_public_key || !formData.stripe_private_key) {
            setMessage({ type: 'error', text: 'Please enter both Stripe keys before validating' })
            setTimeout(() => setMessage(null), 3000)
            return
        }

        setValidating(true)
        setValidationStatus({ validated: false, validatedAt: null })

        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/stripe/validate`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        publishable_key: formData.stripe_public_key,
                        secret_key: formData.stripe_private_key,
                    }),
                }
            )

            const data = await response.json()

            if (data.valid) {
                setValidationStatus({
                    validated: true,
                    validatedAt: new Date().toISOString(),
                })
                setMessage({
                    type: 'success',
                    text: `Stripe keys validated successfully (${data.environment} mode)`
                })
                setTimeout(() => setMessage(null), 5000)
            } else {
                setValidationStatus({
                    validated: false,
                    validatedAt: null,
                    error: data.error,
                })
                setMessage({ type: 'error', text: data.error || 'Stripe key validation failed' })
                setTimeout(() => setMessage(null), 5000)
            }
        } catch (err: any) {
            setValidationStatus({
                validated: false,
                validatedAt: null,
                error: err.message,
            })
            setMessage({ type: 'error', text: err.message || 'Failed to validate Stripe keys' })
            setTimeout(() => setMessage(null), 5000)
        } finally {
            setValidating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Warn if keys changed but not validated
        if ((formData.stripe_public_key || formData.stripe_private_key) && !validationStatus.validated) {
            if (!confirm('Stripe keys have not been validated. Save anyway?')) {
                return
            }
        }

        setSaving(true)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/financial`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to save financial data')
            }

            setMessage({ type: 'success', text: 'Financial details updated successfully' })
            setTimeout(() => setMessage(null), 3000)
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to save financial data' })
            setTimeout(() => setMessage(null), 5000)
        } finally {
            setSaving(false)
        }
    }

    // Reset validation status when keys change
    const handleKeyChange = (field: 'stripe_public_key' | 'stripe_private_key', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (validationStatus.validated) {
            setValidationStatus({ validated: false, validatedAt: null })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div
                    className={`p-3 rounded-md flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                    <span>{message.text}</span>
                </div>
            )}
            {/* Bank Details Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Bank Details</CardTitle>
                    <CardDescription>
                        Bank account information for {organizationName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="iban">IBAN</Label>
                        <Input
                            id="iban"
                            type="text"
                            value={formData.iban}
                            onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                            placeholder="IE29 AIBK 9311 5212 3456 78"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bic">BIC</Label>
                        <Input
                            id="bic"
                            type="text"
                            value={formData.bic}
                            onChange={(e) => setFormData(prev => ({ ...prev, bic: e.target.value }))}
                            placeholder="AIBKIE2D"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="account_name">Account Name</Label>
                        <Input
                            id="account_name"
                            type="text"
                            value={formData.account_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                            placeholder="Account holder name"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stripe Keys Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Stripe Payment Keys</CardTitle>
                    <CardDescription>
                        Stripe API keys for online payment processing
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stripe_public_key">Stripe Public Key</Label>
                        <Input
                            id="stripe_public_key"
                            type="text"
                            value={formData.stripe_public_key}
                            onChange={(e) => handleKeyChange('stripe_public_key', e.target.value)}
                            placeholder="pk_test_..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stripe_private_key">Stripe Private Key</Label>
                        <div className="relative">
                            <Input
                                id="stripe_private_key"
                                type={showPrivateKey ? 'text' : 'password'}
                                value={formData.stripe_private_key}
                                onChange={(e) => handleKeyChange('stripe_private_key', e.target.value)}
                                placeholder="sk_test_..."
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                            >
                                {showPrivateKey ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stripe_webhook_secret">Stripe Webhook Secret</Label>
                        <div className="relative">
                            <Input
                                id="stripe_webhook_secret"
                                type={showPrivateKey ? 'text' : 'password'}
                                value={formData.stripe_webhook_secret}
                                onChange={(e) => handleKeyChange('stripe_webhook_secret' as any, e.target.value)}
                                placeholder="whsec_..."
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                            >
                                {showPrivateKey ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Get this from your Stripe Dashboard → Developers → Webhooks
                        </p>
                    </div>

                    {/* Validation Section */}
                    <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {validationStatus.validated ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Keys Validated</p>
                                            {validationStatus.validatedAt && (
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(validationStatus.validatedAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : validationStatus.error ? (
                                    <>
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="text-sm font-medium text-red-600">Validation Failed</p>
                                            <p className="text-xs text-muted-foreground">{validationStatus.error}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                        <p className="text-sm font-medium text-amber-600">Keys Not Validated</p>
                                    </>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleValidateStripeKeys}
                                disabled={validating || !formData.stripe_public_key || !formData.stripe_private_key}
                            >
                                {validating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Validate Keys
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Financial Details
                </Button>
            </div>
        </form>
    )
}

