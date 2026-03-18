"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm, FormProvider, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, ArrowRight, ArrowLeft, Loader2, CreditCard, Sparkles, CheckCircle2 } from "lucide-react"
import { MemberIntakeFields } from "./member-intake-fields"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface MembershipRegistrationFormProps {
    group: any
    config: any
    form: any
    fields: any[]
    user: any
}

type Step = 'welcome' | 'members' | 'payment_method' | 'summary'

export function MembershipRegistrationForm({ group, config, form, fields, user }: MembershipRegistrationFormProps) {
    const [step, setStep] = useState<Step>('welcome')
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const methods = useForm({
        defaultValues: {
            members: [{ member_name: '', data: {} }],
            payment_method: 'full'
        }
    })

    const { control, handleSubmit, watch, setValue } = methods
    const { fields: memberFields, append, remove } = useFieldArray({
        control,
        name: "members"
    })

    const watchMembers = watch("members")
    const watchPaymentMethod = watch("payment_method")

    // Price Calculation logic
    const totals = useMemo(() => {
        let subtotal = 0
        let discount = 0
        let count = 0

        watchMembers.forEach(() => {
            let memberBase = 0
            config.membership_fee_items.forEach((item: any) => {
                let itemAmount = item.amount
                if (config.enable_multi_child_discount && count > 0 && item.apply_discount) {
                    if (config.discount_type === 'per_child') {
                        const perChildDiscounts = config.per_child_discounts || []
                        const childDiscount = perChildDiscounts[count - 1] || 0
                        discount += Math.min(itemAmount, childDiscount)
                    } else if (config.discount_type === 'percentage') {
                        const d = itemAmount * (config.discount_value / 100)
                        discount += d
                    } else {
                        const d = Math.min(itemAmount, config.discount_value)
                        discount += d
                    }
                }
                memberBase += itemAmount
            })
            subtotal += memberBase
            count++
        })

        return {
            subtotal,
            discount,
            total: subtotal - discount
        }
    }, [watchMembers, config])

    const onSubmit = async (data: any) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/organizations/group/${group.id}/membership/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({
                    members: data.members.map((m: any) => ({
                        member_name: m.data.first_name ? `${m.data.first_name} ${m.data.last_name || ''}` : 'Untitled Member',
                        details: m.data
                    })),
                    payment_method: data.payment_method,
                    is_draft: false
                })
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Failed to submit registration')
            }

            const result = await response.json()

            // If it's a Stripe payment, we would redirect here.
            // For now, show success
            toast({
                title: "Registration Submitted",
                description: "Redirecting to payment...",
            })

            // In a real implementation, the API would return a Stripe URL
            if (result.checkout_url) {
                window.location.href = result.checkout_url
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

    const nextStep = () => {
        if (step === 'welcome') setStep('members')
        else if (step === 'members') setStep('payment_method')
        else if (step === 'payment_method') setStep('summary')
    }

    const prevStep = () => {
        if (step === 'summary') setStep('payment_method')
        else if (step === 'payment_method') setStep('members')
        else if (step === 'members') setStep('welcome')
    }

    const stepProgress = {
        'welcome': 25,
        'members': 50,
        'payment_method': 75,
        'summary': 100
    }

    return (
        <FormProvider {...methods}>
            <div className="space-y-8">
                <Progress value={stepProgress[step]} className="h-2" />

                {step === 'welcome' && (
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0">
                            <CardTitle className="text-2xl">Welcome</CardTitle>
                            <CardDescription className="text-lg">
                                {config.intro_text || 'Please complete the registration form for your child(ren).'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pt-6">
                            <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Fee Information
                                </h4>
                                <ul className="space-y-2">
                                    {config.membership_fee_items.map((item: any, i: number) => (
                                        <li key={i} className="flex justify-between text-sm">
                                            <span>{item.description}</span>
                                            <span className="font-medium">€{item.amount.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                                {config.enable_multi_child_discount && (
                                    <Badge variant="secondary" className="mt-4 bg-primary/10 text-primary border-primary/20">
                                        {config.discount_value}{config.discount_type === 'percentage' ? '%' : '€'} Multi-child discount available
                                    </Badge>
                                )}
                            </div>
                            <Button onClick={nextStep} size="lg" className="w-full mt-8">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 'members' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">Register Members</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ member_name: '', data: {} })}
                                className="border-primary text-primary hover:bg-primary/5"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another Child
                            </Button>
                        </div>

                        {memberFields.map((field, index) => (
                            <div key={field.id} className="relative group">
                                <MemberIntakeFields index={index} fields={fields} />
                                {memberFields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button type="button" onClick={nextStep} className="flex-1">
                                Next: Payment Options
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'payment_method' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Choose Payment Method</CardTitle>
                                <CardDescription>Select how you would like to pay the total membership fees.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    defaultValue={watchPaymentMethod}
                                    onValueChange={(val) => setValue('payment_method', val)}
                                    className="grid grid-cols-1 gap-4"
                                >
                                    <div className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                                        <RadioGroupItem value="full" id="m-full" />
                                        <Label htmlFor="m-full" className="flex-1 cursor-pointer">
                                            <div className="font-bold">Pay in Full</div>
                                            <div className="text-sm text-muted-foreground text-pretty">Pay your annual membership in one go.</div>
                                        </Label>
                                    </div>

                                    {config.enable_weekly_payments && (
                                        <div className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                                            <RadioGroupItem value="weekly" id="m-weekly" />
                                            <Label htmlFor="m-weekly" className="flex-1 cursor-pointer">
                                                <div className="font-bold">Weekly Installments</div>
                                                <div className="text-sm text-muted-foreground text-pretty">Spread the cost across weekly payments.</div>
                                            </Label>
                                        </div>
                                    )}

                                    {config.enable_monthly_payments && (
                                        <div className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                                            <RadioGroupItem value="monthly" id="m-monthly" />
                                            <Label htmlFor="m-monthly" className="flex-1 cursor-pointer">
                                                <div className="font-bold">Monthly Installments</div>
                                                <div className="text-sm text-muted-foreground text-pretty">Spread the cost across monthly payments.</div>
                                            </Label>
                                        </div>
                                    )}

                                    {config.enable_tiered_payments && (
                                        <div className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                                            <RadioGroupItem value="tiered" id="m-tiered" />
                                            <Label htmlFor="m-tiered" className="flex-1 cursor-pointer">
                                                <div className="font-bold">Tiered Payment</div>
                                                <div className="text-sm text-muted-foreground text-pretty">Pay a deposit now and the balance later.</div>
                                            </Label>
                                        </div>
                                    )}
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button type="button" onClick={nextStep} className="flex-1">
                                Next: Summary
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'summary' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                                <CardDescription>Review your details before proceeding to payment.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Registrations</h4>
                                    {watchMembers.map((m: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                                            <div>
                                                <div className="font-medium text-pretty">{m.data.first_name ? `${m.data.first_name} ${m.data.last_name || ''}` : `Child #${i + 1}`}</div>
                                                <div className="text-xs text-muted-foreground">Annual Membership</div>
                                            </div>
                                            <div className="font-bold">
                                                €{config.membership_fee_items.reduce((acc: number, item: any) => acc + item.amount, 0).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 pt-4 border-t-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>€{totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    {totals.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600 font-medium">
                                            <span>Multi-child Discount</span>
                                            <span>-€{totals.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-black pt-2">
                                        <span>Total</span>
                                        <span className="text-primary text-pretty">€{totals.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted/30 rounded-lg border flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-sm">Selected Payment: {watchPaymentMethod.charAt(0).toUpperCase() + watchPaymentMethod.slice(1)}</div>
                                        <p className="text-xs text-muted-foreground">You will be redirected to Stripe to securely complete your payment.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                    Complete & Pay
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </FormProvider>
    )
}
