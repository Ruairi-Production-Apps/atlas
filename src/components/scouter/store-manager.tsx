"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StoreProduct } from '@/lib/supabase/queries'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
import { ProductForm } from './product-form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { validateStoreReadiness } from '@/app/actions/store-validation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StoreOrdersList } from './store-orders-list'

interface StoreManagerProps {
    scopeType: 'province' | 'county' | 'group'
    scopeId: string
}

export function StoreManager({ scopeType, scopeId }: StoreManagerProps) {
    const supabase = createClient()
    const { toast } = useToast()
    const [products, setProducts] = useState<StoreProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editingProduct, setEditingProduct] = useState<StoreProduct | undefined>(undefined)
    const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null)
    const [stats, setStats] = useState({ sold: 0, gross: 0, net: 0 })

    const checkReadiness = useCallback(async () => {
        const result = await validateStoreReadiness(scopeType, scopeId)
        setStripeConfigured(result.isValid)
        if (!result.isValid && result.message) {
            // If validation failed (and potentially unpublished products), we should reload the list
            loadProducts()
        }
    }, [scopeType, scopeId])

    const loadProducts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('store_products')
                .select('*')
                .eq('scope_type', scopeType)
                .eq('scope_id', scopeId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error loading products:', error)
            toast({ variant: "destructive", title: "Error", description: "Failed to load products" })
        } finally {
            setLoading(false)
        }
    }, [scopeType, scopeId, toast])

    const loadStats = useCallback(async () => {
        try {
            const { data: orders, error } = await supabase
                .from('store_orders')
                .select('*, store_order_items(quantity)')
                .eq('scope_type', scopeType)
                .eq('scope_id', scopeId)
                .eq('status', 'paid')

            if (error) throw error

            let sold = 0
            let gross = 0
            let net = 0
            const FEE_PERCENT = 0.015
            const FEE_FIXED = 0.25

            orders?.forEach(order => {
                const amount = order.total_amount || 0
                gross += amount

                if (amount > 0) {
                    const fee = (amount * FEE_PERCENT) + FEE_FIXED
                    net += Math.max(0, amount - fee)
                }

                order.store_order_items?.forEach((item: any) => {
                    sold += (item.quantity || 0)
                })
            })

            setStats({ sold, gross, net })
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }, [scopeType, scopeId, supabase])

    useEffect(() => {
        loadProducts()
        loadStats()
        checkReadiness()
    }, [loadProducts, loadStats, checkReadiness])

    const handleCreate = () => {
        setEditingProduct(undefined)
        setIsEditing(true)
    }

    const handleEdit = (product: StoreProduct) => {
        setEditingProduct(product)
        setIsEditing(true)
    }

    const handleDelete = async (product: StoreProduct) => {
        if (!confirm(`Are you sure you want to delete "${product.title}"?`)) return

        try {
            const { error } = await supabase
                .from('store_products')
                .delete()
                .eq('id', product.id)

            if (error) throw error

            setProducts(prev => prev.filter(p => p.id !== product.id))
            toast({ title: "Deleted", description: "Product deleted successfully" })
        } catch (error: any) {
            console.error('Error deleting product:', error)
            toast({ variant: "destructive", title: "Error", description: error.message })
        }
    }

    const handleSuccess = () => {
        setIsEditing(false)
        loadProducts()
        loadStats()
    }

    if (isEditing) {
        return (
            <ProductForm
                product={editingProduct}
                scopeType={scopeType}
                scopeId={scopeId}
                stripeConfigured={stripeConfigured}
                onSuccess={handleSuccess}
                onCancel={() => setIsEditing(false)}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Products Sold
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.sold}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Income (Gross)
                        </CardTitle>
                        <div className="h-4 w-4 font-bold text-muted-foreground">€</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            €{stats.gross.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Est. Net Income
                        </CardTitle>
                        <div className="h-4 w-4 font-bold text-muted-foreground">€</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            €{stats.net.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            After estimated fees
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="products" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="products">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Store Products</CardTitle>
                                <CardDescription>Manage products available for purchase.</CardDescription>
                            </div>
                            <Button onClick={handleCreate} disabled={stripeConfigured === false}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {stripeConfigured === false && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Stripe Configuration Required</AlertTitle>
                                    <AlertDescription>
                                        Your organization does not have valid Stripe keys configured. Store management is disabled, and all products have been unpublished.
                                        Please add your Stripe API keys in the generic "Details" or "Financial" tabs (depending on implementation) to enable the store.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No products found.</p>
                                    <Button variant="link" onClick={handleCreate}>Create your first product</Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.title}</TableCell>
                                                <TableCell>€{product.price.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    {product.quantity === null ? 'Unlimited' : product.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {product.published ? (
                                                        <Badge variant="default" className="bg-green-600">Published</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Draft</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(product)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>View and manage customer orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StoreOrdersList scopeType={scopeType} scopeId={scopeId} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
