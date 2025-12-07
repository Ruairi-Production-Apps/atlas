'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Truck, Eye, Package, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from '@/components/ui/separator'

interface StoreOrdersListProps {
    scopeType: 'province' | 'county' | 'group'
    scopeId: string
}

interface OrderItem {
    id: string
    quantity: number
    unit_price: number
    total_price: number
    store_products: {
        title: string
    }
}

interface Order {
    id: string
    created_at: string
    customer_name: string
    customer_email: string
    total_amount: number
    status: 'pending' | 'paid' | 'failed'
    fulfillment_status: 'unfulfilled' | 'shipped' | 'returned'
    shipped_at: string | null
    shipping_details: any
    store_order_items: OrderItem[]
    stripe_session_id?: string
}

export function StoreOrdersList({ scopeType, scopeId }: StoreOrdersListProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        loadOrders()
    }, [scopeType, scopeId])

    const loadOrders = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('store_orders')
            .select('*, store_order_items(id, quantity, unit_price, total_price, store_products(title))')
            .eq('scope_type', scopeType)
            .eq('scope_id', scopeId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error loading orders:', error)
            toast({
                title: 'Error',
                description: 'Failed to load orders',
                variant: 'destructive',
            })
        } else {
            setOrders(data || [])
        }
        setLoading(false)
    }

    const handleMarkShipped = async (orderId: string) => {
        setUpdating(orderId)
        try {
            const { error } = await supabase
                .from('store_orders')
                .update({
                    fulfillment_status: 'shipped',
                    shipped_at: new Date().toISOString(),
                })
                .eq('id', orderId)

            if (error) throw error

            toast({
                title: 'Order Updated',
                description: 'Order marked as shipped',
            })

            // Update local state
            const updatedOrders = orders.map(o =>
                o.id === orderId
                    ? { ...o, fulfillment_status: 'shipped' as const, shipped_at: new Date().toISOString() }
                    : o
            )
            setOrders(updatedOrders)

            // Also update selected order if open
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(updatedOrders.find(o => o.id === orderId) || null)
            }

        } catch (err: any) {
            console.error('Error updating order:', err)
            toast({
                title: 'Error',
                description: 'Failed to update order status',
                variant: 'destructive',
            })
        } finally {
            setUpdating(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Fulfillment</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                // Summarize products string
                                const productSummary = order.store_order_items?.map(i => i.store_products?.title || 'Unknown Product').join(', ') || 'No Items'
                                const truncatedSummary = productSummary.length > 50 ? productSummary.substring(0, 50) + '...' : productSummary

                                return (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            {new Date(order.created_at).toLocaleDateString()}
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(order.created_at).toLocaleTimeString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{order.customer_name}</div>
                                            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={productSummary}>
                                            <span className="text-sm text-muted-foreground">{truncatedSummary}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                order.status === 'paid' ? 'default' :
                                                    order.status === 'pending' ? 'outline' : 'destructive'
                                            }>
                                                {order.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {order.fulfillment_status === 'shipped' ? (
                                                <div className="flex items-center text-green-600 gap-1 text-sm font-medium">
                                                    <Truck className="h-4 w-4" />
                                                    Shipped
                                                </div>
                                            ) : (
                                                <Badge variant="secondary">Unfulfilled</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(order.total_amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Manage
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Order Details</SheetTitle>
                        <SheetDescription>
                            Review order information and manage fulfillment.
                        </SheetDescription>
                    </SheetHeader>
                    {selectedOrder && (
                        <div className="mt-6 space-y-6">

                            {/* Order Summary */}
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order ID</span>
                                    <span className="font-mono">{selectedOrder.id.slice(0, 8)}...</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Date</span>
                                    <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={selectedOrder.status === 'paid' ? 'default' : 'outline'}>
                                        {selectedOrder.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total</span>
                                    <span className="font-bold">{formatCurrency(selectedOrder.total_amount)}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Customer Info */}
                            <div>
                                <h3 className="font-semibold mb-2">Customer</h3>
                                <div className="text-sm space-y-1">
                                    <p><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                                    <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                                    {selectedOrder.shipping_details?.address && (
                                        <div className="mt-2 text-muted-foreground bg-muted p-2 rounded">
                                            <p className="font-medium text-foreground text-xs uppercase tracking-wider mb-1">Shipping Address</p>
                                            <p>{selectedOrder.shipping_details.address.line1}</p>
                                            {selectedOrder.shipping_details.address.line2 && <p>{selectedOrder.shipping_details.address.line2}</p>}
                                            <p>{selectedOrder.shipping_details.address.city}, {selectedOrder.shipping_details.address.postal_code}</p>
                                            <p>{selectedOrder.shipping_details.address.country}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Items */}
                            <div>
                                <h3 className="font-semibold mb-3">Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.store_order_items?.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start text-sm">
                                            <div className="flex gap-3">
                                                <div className="bg-muted h-8 w-8 flex items-center justify-center rounded">
                                                    <Package className="h-4 w-4 opacity-50" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.store_products?.title}</p>
                                                    <p className="text-muted-foreground">Qty: {item.quantity} x {formatCurrency(item.unit_price)}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium">{formatCurrency(item.total_price)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Actions */}
                            <div className="pt-2">
                                <h3 className="font-semibold mb-3">Fulfillment</h3>
                                {selectedOrder.fulfillment_status === 'shipped' ? (
                                    <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <div>
                                            <p className="font-medium">Order Shipped</p>
                                            <p className="text-xs">Shipped on {selectedOrder.shipped_at ? new Date(selectedOrder.shipped_at).toLocaleDateString() : 'Unknown date'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            Mark this order as shipped once you have sent the items.
                                        </p>
                                        <Button
                                            className="w-full"
                                            onClick={() => handleMarkShipped(selectedOrder.id)}
                                            disabled={!!updating || selectedOrder.status !== 'paid'}
                                        >
                                            {updating === selectedOrder.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Truck className="h-4 w-4 mr-2" />
                                            )}
                                            Mark as Shipped
                                        </Button>
                                        {selectedOrder.status !== 'paid' && (
                                            <p className="text-xs text-red-500 text-center">
                                                Cannot fulfill unpaid orders.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
