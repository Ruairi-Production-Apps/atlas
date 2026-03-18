'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Trash2, Save, Info, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { FormBuilder } from './form-builder'
import { MembershipRegistrationsList } from './membership-registrations-list'
import { MembershipCommunications } from './membership-communications'

interface FeeItem {
    id?: string
    description: string
    amount: number
    apply_discount: boolean
}

interface MembershipConfig {
    id?: string
    intro_text: string
    registration_deadline: string | null
    published: boolean
    enable_multi_child_discount: boolean
    discount_value: number
    discount_type: 'fixed' | 'percentage' | 'per_child'
    per_child_discounts: number[]
    enable_weekly_payments: boolean
    enable_monthly_payments: boolean
    enable_tiered_payments: boolean
    schedule_start_date: string | null
    schedule_end_date: string | null
    rounding_mode: 'final_payment' | 'distribute'
    missed_payment_handling: 'accumulate' | 'spread'
    tiered_initial_amount: number
    tiered_final_date: string | null
    min_payment_amount: number
    membership_fee_items: FeeItem[]
}

interface MembershipForm {
    id: string
    title: string
    description: string
    button_text: string
}

interface MembershipSetupFormProps {
    groupId: string
}

export function MembershipSetupForm({ groupId }: MembershipSetupFormProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("members")
    const [config, setConfig] = useState<MembershipConfig>({
        intro_text: '',
        registration_deadline: null,
        published: false,
        enable_multi_child_discount: false,
        discount_value: 0,
        discount_type: 'fixed',
        per_child_discounts: [0, 0, 0, 0, 0],
        enable_weekly_payments: false,
        enable_monthly_payments: false,
        enable_tiered_payments: false,
        schedule_start_date: null,
        schedule_end_date: null,
        rounding_mode: 'final_payment',
        missed_payment_handling: 'accumulate',
        tiered_initial_amount: 0,
        tiered_final_date: null,
        min_payment_amount: 5,
        membership_fee_items: []
    })
    const [form, setForm] = useState<MembershipForm | null>(null)

    useEffect(() => {
        loadConfig()
    }, [groupId])

    const loadConfig = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/organizations/group/${groupId}/membership/setup`)
            if (!response.ok) throw new Error('Failed to load membership configuration')
            const data = await response.json()
            if (data.config) {
                setConfig({
                    ...data.config,
                    membership_fee_items: data.config.membership_fee_items || [],
                    per_child_discounts: data.config.per_child_discounts || [0, 0, 0, 0, 0]
                })
            }
            if (data.form) {
                setForm(data.form)
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch(`/api/organizations/group/${groupId}/membership/setup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({
                    ...config,
                    fee_items: config.membership_fee_items
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to save configuration')
            }

            toast({
                title: "Success",
                description: "Membership registration settings saved.",
            })
            await loadConfig()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const addFeeItem = () => {
        setConfig(prev => ({
            ...prev,
            membership_fee_items: [
                ...prev.membership_fee_items,
                { description: '', amount: 0, apply_discount: true }
            ]
        }))
    }

    const removeFeeItem = (index: number) => {
        setConfig(prev => ({
            ...prev,
            membership_fee_items: prev.membership_fee_items.filter((_, i) => i !== index)
        }))
    }

    const updateFeeItem = (index: number, field: keyof FeeItem, value: any) => {
        setConfig(prev => {
            const newItems = [...prev.membership_fee_items]
            newItems[index] = { ...newItems[index], [field]: value }
            return { ...prev, membership_fee_items: newItems }
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="members">Registrations</TabsTrigger>
                <TabsTrigger value="settings">General Settings</TabsTrigger>
                <TabsTrigger value="form">Intake Form</TabsTrigger>
                <TabsTrigger value="comms">Communications</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-6">
                <MembershipRegistrationsList groupId={groupId} />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Membership Registration Setup</CardTitle>
                            <CardDescription>
                                Configure how parents register their children and pay membership fees.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Intro & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="intro_text">Welcome Message</Label>
                                    <Textarea
                                        id="intro_text"
                                        placeholder="Message displayed to parents at the start of registration..."
                                        value={config.intro_text}
                                        onChange={e => setConfig(prev => ({ ...prev, intro_text: e.target.value }))}
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="published">Enable Registration</Label>
                                        <Switch
                                            id="published"
                                            checked={config.published}
                                            onCheckedChange={checked => setConfig(prev => ({ ...prev, published: checked }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Registration Deadline</Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            value={config.registration_deadline?.split('T')[0] || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, registration_deadline: e.target.value || null }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* Fee Items */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Fee Items</h3>
                                    <Button variant="outline" size="sm" onClick={addFeeItem}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Fee Item
                                    </Button>
                                </div>
                                <CardDescription>
                                    Create one or more items (e.g., Group Fee, Scouting Ireland Fee) that make up the total registration cost.
                                </CardDescription>

                                {config.membership_fee_items.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/50">
                                        <p className="text-sm text-muted-foreground">No fee items yet. Add one to get started.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {config.membership_fee_items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                                                <div className="flex-1 space-y-1">
                                                    <Input
                                                        placeholder="Description (e.g., Annual Membership Fee)"
                                                        value={item.description}
                                                        onChange={e => updateFeeItem(index, 'description', e.target.value)}
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <Input
                                                        type="number"
                                                        placeholder="€0.00"
                                                        value={item.amount || ''}
                                                        onChange={e => updateFeeItem(index, 'amount', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 px-2">
                                                    <Switch
                                                        checked={item.apply_discount}
                                                        onCheckedChange={checked => updateFeeItem(index, 'apply_discount', checked)}
                                                    />
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">Apply Discount</span>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => removeFeeItem(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <hr />

                            {/* Discounts */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-medium">Multi-Child Discount</h3>
                                        <CardDescription>Apply a discount for families registering more than one child.</CardDescription>
                                    </div>
                                    <Switch
                                        checked={config.enable_multi_child_discount}
                                        onCheckedChange={checked => setConfig(prev => ({ ...prev, enable_multi_child_discount: checked }))}
                                    />
                                </div>

                                {config.enable_multi_child_discount && (
                                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Discount Type</Label>
                                                <Select
                                                    value={config.discount_type}
                                                    onValueChange={(val: any) => setConfig(prev => ({ ...prev, discount_type: val }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="fixed">Fixed Amount (€) — same for each extra child</SelectItem>
                                                        <SelectItem value="percentage">Percentage (%) — same for each extra child</SelectItem>
                                                        <SelectItem value="per_child">Per Child — set a different discount for each child</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {config.discount_type !== 'per_child' && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label>Value</Label>
                                                        <Input
                                                            type="number"
                                                            value={config.discount_value || ''}
                                                            onChange={e => setConfig(prev => ({ ...prev, discount_value: parseFloat(e.target.value) }))}
                                                            placeholder={config.discount_type === 'fixed' ? '€0.00' : '0%'}
                                                        />
                                                    </div>
                                                    <div className="flex items-end pb-2">
                                                        <p className="text-xs text-muted-foreground">Discount applies from the 2nd child onwards.</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {config.discount_type === 'per_child' && (
                                            <div className="space-y-3">
                                                <p className="text-sm text-muted-foreground">
                                                    Set the discount amount (€) for each additional child. The 1st child always pays full price.
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                                                    {[0, 1, 2, 3, 4].map(i => (
                                                        <div key={i} className="space-y-1">
                                                            <Label className="text-xs">Child {i + 2} discount</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                placeholder="€0.00"
                                                                value={config.per_child_discounts[i] || ''}
                                                                onChange={e => {
                                                                    const newDiscounts = [...(config.per_child_discounts || [0, 0, 0, 0, 0])]
                                                                    newDiscounts[i] = parseFloat(e.target.value) || 0
                                                                    setConfig(prev => ({ ...prev, per_child_discounts: newDiscounts }))
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Info className="h-3 w-3" />
                                                    Set to €0 for children that don't get a discount. Discount is subtracted from each fee item marked "Apply Discount".
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <hr />

                            {/* Payment Methods */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Payment Options</h3>
                                <CardDescription>Select which payment methods parents can use.</CardDescription>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className={config.enable_weekly_payments ? 'border-primary' : ''}>
                                        <CardHeader className="p-4 flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm">Weekly Installments</CardTitle>
                                            <Switch
                                                checked={config.enable_weekly_payments}
                                                onCheckedChange={checked => setConfig(prev => ({ ...prev, enable_weekly_payments: checked }))}
                                            />
                                        </CardHeader>
                                    </Card>
                                    <Card className={config.enable_monthly_payments ? 'border-primary' : ''}>
                                        <CardHeader className="p-4 flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm">Monthly Installments</CardTitle>
                                            <Switch
                                                checked={config.enable_monthly_payments}
                                                onCheckedChange={checked => setConfig(prev => ({ ...prev, enable_monthly_payments: checked }))}
                                            />
                                        </CardHeader>
                                    </Card>
                                    <Card className={config.enable_tiered_payments ? 'border-primary' : ''}>
                                        <CardHeader className="p-4 flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm">Tiered Payment</CardTitle>
                                            <Switch
                                                checked={config.enable_tiered_payments}
                                                onCheckedChange={checked => setConfig(prev => ({ ...prev, enable_tiered_payments: checked }))}
                                            />
                                        </CardHeader>
                                    </Card>
                                </div>

                                {(config.enable_weekly_payments || config.enable_monthly_payments) && (
                                    <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                                        <h4 className="text-sm font-medium">Installment Schedule Config</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Schedule Start Date</Label>
                                                <Input
                                                    type="date"
                                                    value={config.schedule_start_date || ''}
                                                    onChange={e => setConfig(prev => ({ ...prev, schedule_start_date: e.target.value || null }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Schedule End Date</Label>
                                                <Input
                                                    type="date"
                                                    value={config.schedule_end_date || ''}
                                                    onChange={e => setConfig(prev => ({ ...prev, schedule_end_date: e.target.value || null }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Rounding Strategy</Label>
                                                <Select
                                                    value={config.rounding_mode}
                                                    onValueChange={(val: any) => setConfig(prev => ({ ...prev, rounding_mode: val }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="final_payment">Add rounding to final payment</SelectItem>
                                                        <SelectItem value="distribute">Distribute across all payments</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Missed Payment Handling</Label>
                                                <Select
                                                    value={config.missed_payment_handling}
                                                    onValueChange={(val: any) => setConfig(prev => ({ ...prev, missed_payment_handling: val }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="accumulate">Accumulate as arrears</SelectItem>
                                                        <SelectItem value="spread">Spread across remaining schedule</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {config.enable_tiered_payments && (
                                    <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                                        <h4 className="text-sm font-medium">Tiered Payment Config</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Initial Payment Amount (€)</Label>
                                                <Input
                                                    type="number"
                                                    value={config.tiered_initial_amount || ''}
                                                    onChange={e => setConfig(prev => ({ ...prev, tiered_initial_amount: parseFloat(e.target.value) }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Final Balance Due Date</Label>
                                                <Input
                                                    type="date"
                                                    value={config.tiered_final_date || ''}
                                                    onChange={e => setConfig(prev => ({ ...prev, tiered_final_date: e.target.value || null }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr />

                            {/* Minimum Payment Amount */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium">Online Payment Settings</h3>
                                    <CardDescription>Configure payment settings for Stripe online payments.</CardDescription>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="min_payment_amount">Minimum Payment Amount (€)</Label>
                                        <Input
                                            id="min_payment_amount"
                                            type="number"
                                            min="1"
                                            step="0.50"
                                            value={config.min_payment_amount || 5}
                                            onChange={e => setConfig(prev => ({ ...prev, min_payment_amount: parseFloat(e.target.value) || 5 }))}
                                        />
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            We suggest a minimum of €5 to avoid Stripe transaction fees consuming small payments.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end sticky bottom-0 p-4 bg-background/80 backdrop-blur-sm border-t rounded-b-lg">
                        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full md:w-auto">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving Settings...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Configuration
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="form" className="mt-6">
                {form ? (
                    <FormBuilder
                        formId={form.id}
                        formTitle={form.title}
                        formDescription={form.description}
                        eventId={groupId} // Using groupId as eventId for membership forms
                        organizationType="group"
                        organizationId={groupId}
                        formButtonText={form.button_text}
                        isMembershipForm={true}
                    />
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}
            </TabsContent>
            <TabsContent value="comms" className="mt-6">
                <MembershipCommunications groupId={groupId} />
            </TabsContent>
        </Tabs>
    )
}
