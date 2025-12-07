'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StoreProduct } from '@/lib/supabase/queries'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { useToast } from '@/components/ui/use-toast'

interface StoreGridProps {
    scopeType: string
    scopeId: string
}

export function StoreGrid({ scopeType, scopeId }: StoreGridProps) {
    const [products, setProducts] = useState<StoreProduct[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const { addItem } = useCartStore()
    const { toast } = useToast()

    useEffect(() => {
        loadProducts()
    }, [scopeId])

    const loadProducts = async () => {
        const { data, error } = await supabase
            .from('store_products')
            .select('*')
            .eq('scope_type', scopeType)
            .eq('scope_id', scopeId)
            .eq('published', true)
            .order('created_at', { ascending: false })

        if (data) {
            setProducts(data as StoreProduct[])
        }
        setLoading(false)
    }

    const handleAddToCart = (product: StoreProduct) => {
        addItem(product)
        toast({
            title: "Added to Cart",
            description: `${product.title} has been added to your cart.`
        })
    }

    if (loading) {
        return <div className="py-12 text-center text-muted-foreground">Loading products...</div>
    }

    if (products.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No products available in the store.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <Card key={product.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="line-clamp-1">{product.title}</CardTitle>
                            <Badge variant="secondary">€{Number(product.price).toFixed(2)}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                            {product.short_description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {product.tags && product.tags.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-4">
                                {product.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        )}
                        {product.shipping_enabled && (
                            <p className="text-xs text-muted-foreground">
                                + Shipping {product.shipping_mode === 'flat_rate' ? '(Flat Rate)' : '(Per Item)'}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => handleAddToCart(product)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
