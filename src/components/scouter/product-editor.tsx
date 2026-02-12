"use client"

import { useState } from 'react'
import { ProductForm } from './product-form'
import { ProductFormsManager } from '../admin/product-forms-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import type { StoreProduct } from '@/lib/supabase/queries'

interface ProductEditorProps {
    product?: StoreProduct
    scopeType: 'province' | 'county' | 'group' | 'team'
    scopeId: string
    onSuccess: () => void
    onCancel: () => void
    stripeConfigured?: boolean | null
}

export function ProductEditor({
    product,
    scopeType,
    scopeId,
    onSuccess,
    onCancel,
    stripeConfigured
}: ProductEditorProps) {
    const [activeTab, setActiveTab] = useState<string>(product ? 'details' : 'details')

    return (
        <div className="space-y-6">
            {product ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="forms">Forms ({product.id ? '?' : '0'})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <ProductForm
                            product={product}
                            scopeType={scopeType}
                            scopeId={scopeId}
                            stripeConfigured={stripeConfigured}
                            onSuccess={onSuccess}
                            onCancel={onCancel}
                        />
                    </TabsContent>

                    <TabsContent value="forms">
                        <Card className="p-6">
                            <ProductFormsManager
                                productId={product.id}
                                organizationType={scopeType}
                                organizationId={scopeId}
                                isSysadmin={false}
                            />
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <ProductForm
                    product={product}
                    scopeType={scopeType}
                    scopeId={scopeId}
                    stripeConfigured={stripeConfigured}
                    onSuccess={onSuccess}
                    onCancel={onCancel}
                />
            )}
        </div>
    )
}
