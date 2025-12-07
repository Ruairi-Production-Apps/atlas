'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCartStore } from '@/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

// Zod Schema for Validation
const addressSchema = z.object({
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    county: z.string().min(1, "County is required"),
    eircode: z.string().optional(),
})

const checkoutSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    shipping: addressSchema,
    billingSameAsShipping: z.boolean().default(true),
    // Use z.any() to allow partial/empty data when hidden, validate conditionally in superRefine
    billing: z.any().optional(),
}).superRefine((data, ctx) => {
    if (!data.billingSameAsShipping) {
        const result = addressSchema.safeParse(data.billing)
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                ctx.addIssue({
                    ...issue,
                    path: ["billing", ...issue.path],
                })
            })
        }
    }
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

const IRISH_COUNTIES = [
    "Antrim", "Armagh", "Carlow", "Cavan", "Clare", "Cork", "Derry", "Donegal", "Down",
    "Dublin", "Fermanagh", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim",
    "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon",
    "Sligo", "Tipperary", "Tyrone", "Waterford", "Westmeath", "Wexford", "Wicklow"
]

function CheckoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { items, totalPrice, clearCart } = useCartStore()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    // Scope from URL
    const scopeId = searchParams.get('scopeId')
    const scopeType = searchParams.get('scopeType')

    // Hydration fix
    useEffect(() => {
        setMounted(true)
    }, [])

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            billingSameAsShipping: true,
            shipping: { county: '' },
            billing: { county: '' }
        },
        shouldUnregister: true // Removes hidden fields from validation data (fixes validation error on hidden billing fields)
    })

    const billingSame = watch('billingSameAsShipping')

    const onError = (errors: any) => {
        console.error("Form Validation Errors:", JSON.stringify(errors, null, 2))
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please check your information and try again.'
        })
    }

    const onSubmit = async (data: CheckoutFormValues) => {
        console.log("Submitting form data:", data)

        if (!scopeId || !scopeType) {
            console.error("Missing scopeId or scopeType")
            toast({ variant: "destructive", title: "Error", description: "Invalid store configuration." })
            return
        }

        setIsLoading(true)
        try {
            const customerDetails = {
                firstName: data.firstName,
                lastName: data.lastName,
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phone: data.phone,
                shipping: data.shipping,
                billing: data.billingSameAsShipping ? data.shipping : data.billing,
            }

            const response = await fetch('/api/store/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    scope_id: scopeId,
                    scope_type: scopeType,
                    customer_details: customerDetails
                })
            })

            const result = await response.json()

            if (result.error) throw new Error(result.error)

            if (result.url) {
                window.location.href = result.url
            } else {
                throw new Error("No redirect URL returned")
            }

        } catch (error: any) {
            console.error("Checkout Error:", error)
            toast({
                variant: 'destructive',
                title: 'Checkout Failed',
                description: error.message || 'Something went wrong. Please try again.'
            })
            setIsLoading(false)
        }
    }

    const handlePayClick = () => {
        if (formRef.current) {
            formRef.current.requestSubmit()
        }
    }

    if (!mounted) return null // Prevent hydration mismatch

    if (items.length === 0) {
        return (
            <div className="container max-w-lg mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Button onClick={() => router.back()}>Return to Store</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-8 pl-0 hover:bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Form */}
                    <div>
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border space-y-8">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Checkout</h1>
                                <p className="text-muted-foreground">Please enter your details below.</p>
                            </div>

                            <form
                                id="checkout-form"
                                ref={formRef}
                                onSubmit={handleSubmit(onSubmit, onError)}
                                className="space-y-6"
                            >
                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Contact Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input id="firstName" {...register('firstName')} placeholder="John" />
                                            {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input id="lastName" {...register('lastName')} placeholder="Doe" />
                                            {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
                                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input id="phone" type="tel" {...register('phone')} placeholder="+353 ..." />
                                            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Shipping Address */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Shipping Address</h3>
                                    <div className="space-y-2">
                                        <Label>Address Line 1</Label>
                                        <Input {...register('shipping.line1')} placeholder="123 Main St" />
                                        {errors.shipping?.line1 && <p className="text-red-500 text-xs">{errors.shipping.line1.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address Line 2 (Optional)</Label>
                                        <Input {...register('shipping.line2')} placeholder="Apt 4B" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>City / Town</Label>
                                            <Input {...register('shipping.city')} placeholder="Dublin" />
                                            {errors.shipping?.city && <p className="text-red-500 text-xs">{errors.shipping.city.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>County</Label>
                                            <Select onValueChange={(val) => setValue('shipping.county', val)} defaultValue={watch('shipping.county')}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select County" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {IRISH_COUNTIES.map(c => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.shipping?.county && <p className="text-red-500 text-xs">{errors.shipping.county.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Eircode / Postcode</Label>
                                        <Input {...register('shipping.eircode')} placeholder="D01 AB12" className="uppercase" />
                                    </div>
                                </div>

                                <Separator />

                                {/* Billing Address */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="billingSame"
                                            checked={billingSame}
                                            onCheckedChange={(checked) => setValue('billingSameAsShipping', checked as boolean)}
                                        />
                                        <Label htmlFor="billingSame" className="font-normal cursor-pointer">Billing address is same as shipping address</Label>
                                    </div>

                                    {!billingSame && (
                                        <div className="space-y-4 pt-4 animate-in slide-in-from-top-2">
                                            <h3 className="font-semibold text-lg">Billing Address</h3>
                                            <div className="space-y-2">
                                                <Label>Address Line 1</Label>
                                                <Input {...register('billing.line1')} placeholder="123 Main St" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Address Line 2</Label>
                                                <Input {...register('billing.line2')} placeholder="Apt 4B" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>City</Label>
                                                    <Input {...register('billing.city')} placeholder="Dublin" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>County</Label>
                                                    <Select onValueChange={(val) => setValue('billing.county', val)} defaultValue={watch('billing.county')}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select County" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {IRISH_COUNTIES.map(c => (
                                                                <SelectItem key={`bill-${c}`} value={c}>{c}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Eircode</Label>
                                                <Input {...register('billing.eircode')} placeholder="D01 AB12" className="uppercase" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-8">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between gap-4 text-sm">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="font-medium">
                                            {formatCurrency(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <div className="py-4 space-y-2">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total</span>
                                    <span>{formatCurrency(totalPrice())}</span>
                                </div>
                                <p className="text-xs text-muted-foreground text-right">+ Shipping (calculated at payment)</p>
                            </div>

                            <Button
                                type="button"
                                onClick={handlePayClick}
                                className="w-full h-12 text-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                Pay Securely
                            </Button>

                            <div className="mt-4 text-center">
                                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    Secure payment powered by Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    )
}
