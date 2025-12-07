import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { eurosToCents } from '@/lib/stripe-helpers'

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const body = await request.json()
        const { items, scope_id, scope_type, customer_details } = body

        if (!items || items.length === 0 || !scope_id || !scope_type) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
        }

        // 1. Fetch Organization Logic (Stripe Keys)
        // 1. Fetch Organization Logic (Stripe Keys)
        let orgQuery = supabase.from(scope_type + 's').select('stripe_private_key, name, slug').eq('id', scope_id).single()
        const { data: org, error: orgError } = await orgQuery

        if (orgError || !org || !org.stripe_private_key) {
            return NextResponse.json({ error: 'Stripe not configured for this organization' }, { status: 400 })
        }

        // 2. Validate Items & Calculate Totals
        const productIds = items.map((i: any) => i.id)
        const { data: products, error: productsError } = await supabase
            .from('store_products')
            .select('*')
            .in('id', productIds)
            .eq('published', true)

        if (productsError || !products || products.length === 0) {
            return NextResponse.json({ error: 'Products not found' }, { status: 400 })
        }

        let totalAmount = 0
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
        const orderItemsData = []

        let totalShipping = 0

        for (const item of items) {
            const product = products.find(p => p.id === item.id)
            if (!product) continue

            const qty = item.quantity
            const price = Number(product.price)
            const itemTotal = price * qty
            totalAmount += itemTotal

            orderItemsData.push({
                product_id: product.id,
                quantity: qty,
                unit_price: price,
                total_price: itemTotal
            })

            // Stripe Line Item
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: product.title,
                        description: product.short_description,
                    },
                    unit_amount: eurosToCents(price),
                },
                quantity: qty,
            })

            // Calculate Shipping
            if (product.shipping_enabled) {
                const shipCost = Number(product.shipping_cost || 0)
                if (product.shipping_mode === 'per_item') {
                    totalShipping += (shipCost * qty)
                } else {
                    // Flat rate (per line item for now)
                    totalShipping += shipCost
                }
            }
        }

        // Add Shipping Line Item if needed
        if (totalShipping > 0) {
            totalAmount += totalShipping
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Shipping',
                        description: 'Total shipping cost',
                    },
                    unit_amount: eurosToCents(totalShipping),
                },
                quantity: 1,
            })
        }

        // 3. Create Pending Order
        const { data: user } = await supabase.auth.getUser()

        const orderData = {
            scope_type,
            scope_id,
            user_id: user.user?.id || null, // Optional
            customer_email: customer_details.email, // Required
            customer_name: customer_details.name,
            total_amount: totalAmount,
            status: 'pending',
            items: orderItemsData, // Can't insert directly yet? 
            // Need to insert Order first, then Items.
        }

        const { data: order, error: orderError } = await supabase
            .from('store_orders')
            .insert({
                scope_type,
                scope_id,
                user_id: orderData.user_id,
                customer_email: orderData.customer_email,
                customer_name: orderData.customer_name,
                total_amount: totalAmount,
                status: 'pending',
                shipping_details: customer_details,
            })
            .select()
            .single()

        if (orderError) {
            console.error('Order creation failed:', orderError)
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
        }

        // Insert Order Items
        const itemsToInsert = orderItemsData.map(item => ({
            ...item,
            order_id: order.id
        }))

        const { error: itemsInsertError } = await supabase
            .from('store_order_items')
            .insert(itemsToInsert)

        if (itemsInsertError) {
            console.error('Order items creation failed:', itemsInsertError)
            // Should rollback order? For now, proceed.
            return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
        }

        // 4. Create Stripe Session
        const stripe = new Stripe(org.stripe_private_key, {
            apiVersion: '2025-11-17.clover' as any,
        })

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const cancelPath = `/${scope_type}s/${org.slug || scope_id}?tab=store`

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${siteUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}${cancelPath}`,
            metadata: {
                order_id: order.id,
                scope_id: scope_id,
            },
            customer_email: customer_details.email,
        })

        // Update Order with Session ID
        await supabase
            .from('store_orders')
            .update({ stripe_session_id: session.id })
            .eq('id', order.id)

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        })

    } catch (error: any) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
