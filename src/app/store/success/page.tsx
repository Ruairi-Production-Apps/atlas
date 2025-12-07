'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useCartStore } from '@/lib/store/cart-store'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const { clearCart } = useCartStore()

    useEffect(() => {
        if (sessionId) {
            clearCart()
        }
    }, [sessionId, clearCart])

    return (
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Thank you for your order. We have received your payment and will be in touch shortly.
                </p>
                {sessionId && (
                    <p className="text-xs text-muted-foreground">
                        Session ID: {sessionId.slice(0, 10)}...
                    </p>
                )}
                <div className="pt-4">
                    <Link href="/">
                        <Button>Return Home</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

export default function StoreSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}>
                <SuccessContent />
            </Suspense>
        </div>
    )
}
