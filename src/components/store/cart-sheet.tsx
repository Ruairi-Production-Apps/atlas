'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CartSheetProps {
    scopeId: string
    scopeType: string
}

export function CartSheet({ scopeId, scopeType }: CartSheetProps) {
    const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCartStore()
    const router = useRouter()

    const total = totalPrice()

    const handleCheckout = () => {
        setIsOpen(false)
        router.push(`/store/checkout?scopeId=${scopeId}&scopeType=${scopeType}`)
    }

    if (items.length === 0) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Your Cart</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Your cart is empty</p>
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {items.length}
                    </span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Your Cart ({items.length} items)</SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 pr-4 -mr-4">
                    <div className="space-y-4 mt-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-medium">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        €{item.price.toFixed(2)}
                                        {item.shipping_enabled && <span className="text-xs ml-2 text-primary">+ Shipping</span>}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-4 text-center text-sm">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="space-y-4 mt-6">
                    <Separator />
                    <div className="flex items-center justify-between font-medium">
                        <span>Total</span>
                        <span>€{total.toFixed(2)} + Shipping</span>
                    </div>

                    <Button className="w-full" onClick={handleCheckout}>
                        Proceed to Checkout
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
