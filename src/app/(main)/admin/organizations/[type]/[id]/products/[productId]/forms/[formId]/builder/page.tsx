import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductFormBuilder } from "@/components/admin/product-form-builder"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminProductFormBuilderPage({
    params,
}: {
    params: Promise<{ type: string; id: string; productId: string; formId: string }>
}) {
    const { type, id, productId, formId } = await params
    const supabase = await createClient()

    // Check if user is authenticated and is sysadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_sysadmin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_sysadmin) {
        redirect('/dashboard')
    }

    // Verify form exists and belongs to product
    const { data: form } = await supabase
        .from('product_forms')
        .select('*')
        .eq('id', formId)
        .eq('product_id', productId)
        .single()

    if (!form) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Product Form Builder</h1>
                    <p className="text-muted-foreground">Form: {form.title}</p>
                </div>
                <Link href={`/admin/organizations/${type}/${id}/products`}>
                    <Button variant="outline">
                        Back to Products
                    </Button>
                </Link>
            </div>
            <ProductFormBuilder
                formId={formId}
                formTitle={form.title}
                formDescription={form.description}
                productId={productId}
                organizationType={type}
                organizationId={id}
            />
        </div>
    )
}
