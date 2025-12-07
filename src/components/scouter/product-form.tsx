"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Badge } from '@/components/ui/badge'
import { FlatpickrDateInput } from '@/components/ui/flatpickr-date-input'
import { Loader2, Plus, X, Calculator } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ProductImageUpload } from './product-image-upload'
import type { StoreProduct } from '@/lib/supabase/queries'

interface ProductFormProps {
    product?: StoreProduct
    scopeType: 'province' | 'county' | 'group'
    scopeId: string
    onSuccess: () => void
    onCancel: () => void
    stripeConfigured?: boolean | null
}

export function ProductForm({ product, scopeType, scopeId, onSuccess, onCancel, stripeConfigured = true }: ProductFormProps) {
    const supabase = createClient()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    // Form State
    const [title, setTitle] = useState(product?.title || '')
    const [shortDescription, setShortDescription] = useState(product?.short_description || '')
    const [description, setDescription] = useState(product?.description || '')
    const [price, setPrice] = useState<string>(product?.price?.toString() || '')
    const [quantity, setQuantity] = useState<string>(product?.quantity?.toString() || '')
    const [isUnlimited, setIsUnlimited] = useState(!product?.quantity && product?.quantity !== 0)
    const [tags, setTags] = useState<string[]>(product?.tags || [])
    const [tagInput, setTagInput] = useState('')

    // Dates
    const [availableFrom, setAvailableFrom] = useState(product?.available_from ? new Date(product.available_from).toISOString().slice(0, 16) : '')
    const [availableTo, setAvailableTo] = useState(product?.available_to ? new Date(product.available_to).toISOString().slice(0, 16) : '')

    // Shipping
    const [shippingEnabled, setShippingEnabled] = useState(product?.shipping_enabled || false)
    const [shippingMode, setShippingMode] = useState<'flat_rate' | 'per_item'>(product?.shipping_mode as any || 'flat_rate')
    const [shippingCost, setShippingCost] = useState<string>(product?.shipping_cost?.toString() || '0')

    const [published, setPublished] = useState(product?.published || false)
    const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url || null)

    // Calculator State
    const [netIncome, setNetIncome] = useState<number | null>(null)

    // Calculate Fees effect
    useEffect(() => {
        const p = parseFloat(price)
        if (!isNaN(p) && p > 0) {
            // Stripe Fee: 1.4% + €0.25
            const fee = (p * 0.014) + 0.25
            const net = p - fee
            setNetIncome(net)
        } else {
            setNetIncome(null)
        }
    }, [price])

    const handleAddTag = () => {
        const tag = tagInput.trim()
        if (tag && !tags.includes(tag)) {
            setTags(prev => [...prev, tag])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const productData = {
                scope_type: scopeType,
                scope_id: scopeId,
                title,
                image_url: imageUrl,
                short_description: shortDescription,
                description,
                price: parseFloat(price) || 0,
                quantity: isUnlimited ? null : (parseInt(quantity) || 0),
                tags,
                available_from: availableFrom ? new Date(availableFrom).toISOString() : null,
                available_to: availableTo ? new Date(availableTo).toISOString() : null,
                shipping_enabled: shippingEnabled,
                shipping_mode: shippingEnabled ? shippingMode : null,
                shipping_cost: shippingEnabled ? (parseFloat(shippingCost) || 0) : 0,
                published,
                updated_at: new Date().toISOString()
            }

            if (product) {
                const { error } = await supabase
                    .from('store_products')
                    .update(productData)
                    .eq('id', product.id)
                if (error) throw error
                toast({ title: "Success", description: "Product updated successfully" })
            } else {
                const { error } = await supabase
                    .from('store_products')
                    .insert(productData)
                if (error) throw error
                toast({ title: "Success", description: "Product created successfully" })
            }
            onSuccess()
        } catch (error: any) {
            console.error('Error saving product:', error)
            toast({ variant: "destructive", title: "Error", description: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
                <CardDescription>Manage your store product details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <ProductImageUpload
                        currentImageUrl={imageUrl}
                        onImageUpdate={setImageUrl}
                    />
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g. Annual Camp T-Shirt"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shortDescription">Short Description (Plain Text)</Label>
                        <Textarea
                            id="shortDescription"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            rows={2}
                            placeholder="Brief summary for listings..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Full Description</Label>
                        <RichTextEditor
                            content={description}
                            onChange={setDescription}
                            placeholder="Detailed product info..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (€) *</Label>
                            <div className="relative">
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    className="pl-6"
                                />
                                <span className="absolute left-2 top-2.5 text-muted-foreground">€</span>
                            </div>
                            {netIncome !== null && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 bg-muted/50 p-2 rounded">
                                    <Calculator className="h-3 w-3" />
                                    <span>
                                        Net Income after Stripe fees (est): <strong>€{netIncome.toFixed(2)}</strong>
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="unlimited"
                                        checked={isUnlimited}
                                        onCheckedChange={(checked) => setIsUnlimited(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="unlimited"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Unlimited
                                    </label>
                                </div>
                                {!isUnlimited && (
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="0"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="In Stock"
                                        className="w-32"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="availableFrom">Available From</Label>
                            <FlatpickrDateInput
                                id="availableFrom"
                                value={availableFrom}
                                onChange={(dates) => setAvailableFrom(dates[0] ? dates[0].toISOString() : '')}
                                placeholder="Select start date"
                            />
                            <p className="text-xs text-muted-foreground">Leave blank to not set</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="availableTo">Available To</Label>
                            <FlatpickrDateInput
                                id="availableTo"
                                value={availableTo}
                                onChange={(dates) => setAvailableTo(dates[0] ? dates[0].toISOString() : '')}
                                placeholder="Select end date"
                            />
                            <p className="text-xs text-muted-foreground">Leave blank to not set</p>
                        </div>
                    </div>

                    <div className="border p-4 rounded-md space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="shipping"
                                checked={shippingEnabled}
                                onCheckedChange={(checked) => setShippingEnabled(checked as boolean)}
                            />
                            <Label htmlFor="shipping" className="text-base">Enable Shipping?</Label>
                        </div>

                        {shippingEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2">
                                <div className="space-y-2">
                                    <Label>Shipping Mode</Label>
                                    <Select
                                        value={shippingMode}
                                        onValueChange={(val: any) => setShippingMode(val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flat_rate">Flat Rate (Total)</SelectItem>
                                            <SelectItem value="per_item">Per Item</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Shipping Cost (€)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddTag()
                                    }
                                }}
                                placeholder="Add tag and press Enter"
                            />
                            <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-1 hover:text-destructive"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="published"
                                checked={published}
                                onCheckedChange={(checked) => setPublished(checked as boolean)}
                                disabled={stripeConfigured === false}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="published"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                >
                                    Publish Product
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    {stripeConfigured === false
                                        ? <span className="text-destructive font-medium">Stripe configuration required to publish.</span>
                                        : "Visible to members immediately."
                                    }
                                </p>
                            </div>
                        </div>
                        {stripeConfigured === false && (
                            <div className="text-xs text-destructive mt-2 pl-6">
                                Products cannot be published until Stripe keys are added to this organization.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {product ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
