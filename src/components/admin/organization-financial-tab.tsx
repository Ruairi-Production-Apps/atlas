'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'

interface OrganizationFinancialTabProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team'
    organizationName: string
}

export function OrganizationFinancialTab({
    organizationId,
    organizationType,
    organizationName,
}: OrganizationFinancialTabProps) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [stripeStatus, setStripeStatus] = useState<{
        accountId: string | null
        chargesEnabled: boolean
        detailsSubmitted: boolean
        accountName: string | null
        accountEmail: string | null
        payoutsEnabled: boolean
        isTest: boolean
        fetchError: string | null
    }>({ accountId: null, chargesEnabled: false, detailsSubmitted: false, accountName: null, accountEmail: null, payoutsEnabled: false, isTest: false, fetchError: null })

    const [formData, setFormData] = useState({
        iban: '',
        bic: '',
        account_name: '',
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
            })
            setStripeStatus({
                accountId: data.stripe_account_id || null,
                chargesEnabled: data.stripe_charges_enabled || false,
                detailsSubmitted: data.stripe_details_submitted || false,
                accountName: data.stripe_account_name || null,
                accountEmail: data.stripe_account_email || null,
                payoutsEnabled: data.stripe_payouts_enabled || false,
                isTest: data.stripe_is_test || false,
                fetchError: data.stripe_fetch_error || null,
            })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to load financial data' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const response = await fetch(
                `/api/organizations/${organizationType}/${organizationId}/financial`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                    },
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

    const handleConnectStripe = () => {
        // Redirect to the connect endpoint
        window.location.href = `/api/stripe/connect?type=${organizationType}&id=${organizationId}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
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

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bank Details Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Details</CardTitle>
                        <CardDescription>
                            Bank account information for {organizationName} (for offline payments)
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
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Bank Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* Stripe Connect Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Stripe Connection</CardTitle>
                    <CardDescription>
                        Connect with Stripe to accept online payments securely
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div>
                            <h3 className="font-medium">Connection Status</h3>
                            {stripeStatus.accountId ? (
                                <div className="flex items-center gap-2 mt-1 text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm">Connected</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stripeStatus.isTest
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : 'bg-green-100 text-green-800 border border-green-200'
                                        }`}>
                                        {stripeStatus.isTest ? '🧪 Test Mode' : '✅ Live'}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 mt-1 text-amber-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">Not Connected</span>
                                </div>
                            )}
                        </div>

                        {!stripeStatus.accountId ? (
                            <Button onClick={handleConnectStripe} className="bg-[#635BFF] hover:bg-[#5851DF] text-white">
                                Connect with Stripe <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={handleConnectStripe}>
                                Re-Connect / Update
                            </Button>
                        )}
                    </div>

                    {/* Account Details */}
                    {stripeStatus.accountId && (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/30 px-4 py-2 border-b">
                                <h4 className="text-sm font-medium text-muted-foreground">Account Details</h4>
                            </div>
                            <div className="divide-y">
                                {stripeStatus.accountName && (
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Account Name</span>
                                        <span className="text-sm font-medium">{stripeStatus.accountName}</span>
                                    </div>
                                )}
                                {stripeStatus.accountEmail && (
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Email</span>
                                        <span className="text-sm font-medium">{stripeStatus.accountEmail}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Account ID</span>
                                    <span className="text-sm font-mono text-muted-foreground">{stripeStatus.accountId}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Charges</span>
                                    <span className={`text-sm font-medium ${stripeStatus.chargesEnabled ? 'text-green-600' : 'text-amber-600'}`}>
                                        {stripeStatus.chargesEnabled ? '✓ Enabled' : '✗ Not Enabled'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Payouts</span>
                                    <span className={`text-sm font-medium ${stripeStatus.payoutsEnabled ? 'text-green-600' : 'text-amber-600'}`}>
                                        {stripeStatus.payoutsEnabled ? '✓ Enabled' : '✗ Not Enabled'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Onboarding</span>
                                    <span className={`text-sm font-medium ${stripeStatus.detailsSubmitted ? 'text-green-600' : 'text-amber-600'}`}>
                                        {stripeStatus.detailsSubmitted ? '✓ Complete' : '✗ Incomplete'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {stripeStatus.accountId && !stripeStatus.chargesEnabled && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm">
                            Your Stripe account is connected but charges are not yet enabled. Please check your email or Stripe Dashboard for any required verification steps.
                        </div>
                    )}

                    {stripeStatus.fetchError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                            {stripeStatus.fetchError}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


