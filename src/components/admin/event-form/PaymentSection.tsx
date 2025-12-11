
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { calculateNetAmount, formatCurrency } from '@/lib/stripe-helpers'
import { EventFormData } from '@/hooks/use-event-form'

interface PaymentSectionProps {
    formData: EventFormData
    financialData: {
        stripe_keys_validated: boolean
        has_bank_details: boolean
    }
    handleCheckboxChange: (id: string, checked: boolean) => void
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    setFormData: React.Dispatch<React.SetStateAction<EventFormData>>
}

export function PaymentSection({
    formData,
    financialData,
    handleCheckboxChange,
    handleInputChange,
    setFormData
}: PaymentSectionProps) {
    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="require_payment"
                        checked={formData.require_payment}
                        onCheckedChange={(checked) => handleCheckboxChange('require_payment', checked as boolean)}
                    />
                    <Label htmlFor="require_payment" className="cursor-pointer">
                        Take Payment
                    </Label>
                </div>
            </div>

            {formData.require_payment && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <select
                            id="payment_method"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.payment_method}
                            onChange={handleInputChange}
                        >
                            <option value="">Select payment method</option>
                            <option value="offline">Take payment offline</option>
                            <option
                                value="bank_payment"
                                disabled={!financialData.has_bank_details}
                            >
                                Bank Payment{!financialData.has_bank_details ? ' - add bank payment info under Organisation Billing to use this' : ''}
                            </option>
                            <option
                                value="stripe"
                                disabled={!financialData.stripe_keys_validated}
                            >
                                Online Payment (Stripe){!financialData.stripe_keys_validated ? ' - add Stripe keys under Organisation Billing to use Stripe' : ''}
                            </option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pricing_mode">Pricing Mode</Label>
                        <select
                            id="pricing_mode"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.pricing_mode || 'per_scout'}
                            onChange={(e) => setFormData(prev => ({ ...prev, pricing_mode: e.target.value as 'per_group' | 'per_scout' | 'per_person_type' }))}
                        >
                            <option value="per_group">Per Group</option>
                            <option value="per_scout">Per Youth Member</option>
                            <option value="per_person_type">Different Prices (Scouters/Youth)</option>
                        </select>
                    </div>

                    {formData.pricing_mode === 'per_person_type' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price_scouter">Price for Scouters (€)</Label>
                                <Input
                                    id="price_scouter"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price_scouter}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price_youth">Price for Youth (€)</Label>
                                <Input
                                    id="price_youth"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price_youth}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="price">
                                {formData.pricing_mode === 'per_scout'
                                    ? 'Price Per Youth Member (€)'
                                    : formData.pricing_mode === 'per_group'
                                        ? 'Price per Group (€)'
                                        : 'Price (€)'}
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                            />
                        </div>
                    )}

                    {/* Stripe Fee Calculator */}
                    {formData.payment_method === 'stripe' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                            <p className="text-sm font-medium text-blue-900">Stripe Fee Information</p>
                            {formData.pricing_mode === 'per_person_type' ? (
                                <>
                                    {formData.price_scouter && parseFloat(formData.price_scouter) > 0 && (
                                        <div className="text-sm text-blue-800">
                                            <span className="font-medium">Scouter Price:</span> {formatCurrency(parseFloat(formData.price_scouter))}
                                            <br />
                                            <span className="text-xs">After Stripe fees (1.4% + €0.25): {formatCurrency(calculateNetAmount(parseFloat(formData.price_scouter)))}</span>
                                        </div>
                                    )}
                                    {formData.price_youth && parseFloat(formData.price_youth) > 0 && (
                                        <div className="text-sm text-blue-800 mt-2">
                                            <span className="font-medium">Youth Price:</span> {formatCurrency(parseFloat(formData.price_youth))}
                                            <br />
                                            <span className="text-xs">After Stripe fees (1.4% + €0.25): {formatCurrency(calculateNetAmount(parseFloat(formData.price_youth)))}</span>
                                        </div>
                                    )}
                                </>
                            ) : formData.price && parseFloat(formData.price) > 0 ? (
                                <div className="text-sm text-blue-800">
                                    <span className="font-medium">Price:</span> {formatCurrency(parseFloat(formData.price))}
                                    <br />
                                    <span className="text-xs">After Stripe fees (1.4% + €0.25): {formatCurrency(calculateNetAmount(parseFloat(formData.price)))}</span>
                                </div>
                            ) : null}
                            <p className="text-xs text-blue-700 mt-2">
                                💡 Consider increasing your price to account for Stripe fees if needed
                            </p>
                        </div>
                    )}
                </>
            )}
        </>
    )
}
