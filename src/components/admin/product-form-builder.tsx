'use client'

import { FormBuilder } from './form-builder'

interface ProductFormBuilderProps {
    formId: string
    formTitle: string
    formDescription?: string | null
    productId: string
    organizationType: string
    organizationId: string
}

export function ProductFormBuilder({
    formId,
    formTitle,
    formDescription,
    productId,
    organizationType,
    organizationId,
}: ProductFormBuilderProps) {
    // Reuse the FormBuilder but override the API paths
    // We'll pass productId as eventId since the structure is the same
    return (
        <FormBuilder
            formId={formId}
            formTitle={formTitle}
            formDescription={formDescription || ''}
            eventId={productId} // Use productId in place of eventId
            organizationType={organizationType}
            organizationId={organizationId}
            formButtonText="Submit"
            isProductForm={true}
        />
    )
}
