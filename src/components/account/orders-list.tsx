'use client'
import { useState } from 'react'
import { UserOrder } from '@/lib/supabase/queries'
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { Eye, Package, Truck, CheckCircle2 } from 'lucide-react'

interface OrdersListProps {
    orders: UserOrder[]
}

export function OrdersList({ orders }: OrdersListProps) {
    const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null)

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
                <h3 className="text-lg font-semibold">No Orders Found</h3>
                <p className="text-muted-foreground mt-2">
                    You haven't purchased anything from the store yet.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Fulfillment</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs">
                                    {order.id.slice(0, 8)}...
                                </TableCell>
                                <TableCell>
                                    {format(new Date(order.created_at), 'PPP')}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={order.store_order_items?.map(i => i.store_products?.title).join(', ')}>
                                    {order.store_order_items?.map(i => i.store_products?.title || 'Unknown').join(', ') || 'No Items'}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(order.total_amount)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                                        {order.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {order.fulfillment_status === 'shipped' ? (
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                            Shipped
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            Unfulfilled
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Order Details</SheetTitle>
                        <SheetDescription>
                            Review your order information.
                        </SheetDescription>
                    </SheetHeader>
                    {selectedOrder && (
                        <div className="mt-6 space-y-6">

                            {/* Order Summary */}
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order ID</span>
                                    <span className="font-mono">{selectedOrder.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Date</span>
                                    <span>{format(new Date(selectedOrder.created_at), 'PP p')}</span>
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

                            {/* Shipping Info */}
                            {selectedOrder.shipping_details?.address && (
                                <div>
                                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded space-y-1">
                                        <p>{selectedOrder.shipping_details.address.line1}</p>
                                        {selectedOrder.shipping_details.address.line2 && <p>{selectedOrder.shipping_details.address.line2}</p>}
                                        <p>{selectedOrder.shipping_details.address.city}, {selectedOrder.shipping_details.address.postal_code}</p>
                                        <p>{selectedOrder.shipping_details.address.country}</p>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Fulfillment Status */}
                            <div>
                                <h3 className="font-semibold mb-3">Fulfillment Status</h3>
                                {selectedOrder.fulfillment_status === 'shipped' ? (
                                    <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <div>
                                            <p className="font-medium">Order Shipped</p>
                                            <p className="text-xs">
                                                Shipped on {selectedOrder.shipped_at ? format(new Date(selectedOrder.shipped_at), 'PPP') : 'Unknown date'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 text-amber-800 p-3 rounded-md border border-amber-200 flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        <div>
                                            <p className="font-medium">Preparing for Shipment</p>
                                            <p className="text-xs">We will notify you when it ships.</p>
                                        </div>
                                    </div>
                                )}
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
                                                    <p className="font-medium">{item.store_products?.title || 'Unknown Item'}</p>
                                                    <p className="text-muted-foreground">Qty: {item.quantity} x {formatCurrency(item.unit_price)}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium">{formatCurrency(item.total_price)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
