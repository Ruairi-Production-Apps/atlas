import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params
    const supabase = await createClient()

    try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse request body
        const body = await request.json()
        const { publishable_key, secret_key } = body

        if (!publishable_key || !secret_key) {
            return NextResponse.json(
                { error: 'Both publishable_key and secret_key are required' },
                { status: 400 }
            )
        }

        // Validate publishable key format
        const isTestKey = publishable_key.startsWith('pk_test_')
        const isLiveKey = publishable_key.startsWith('pk_live_')

        if (!isTestKey && !isLiveKey) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Invalid publishable key format. Must start with pk_test_ or pk_live_'
                },
                { status: 200 }
            )
        }

        // Validate secret key format
        const secretIsTest = secret_key.startsWith('sk_test_')
        const secretIsLive = secret_key.startsWith('sk_live_')

        if (!secretIsTest && !secretIsLive) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Invalid secret key format. Must start with sk_test_ or sk_live_'
                },
                { status: 200 }
            )
        }

        // Ensure both keys are from the same environment
        if ((isTestKey && !secretIsTest) || (isLiveKey && !secretIsLive)) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Keys must be from the same environment (both test or both live)'
                },
                { status: 200 }
            )
        }

        // Validate secret key by making an API call to Stripe
        try {
            const stripe = new Stripe(secret_key, {
                apiVersion: '2025-11-17.clover',
            })

            // Make a lightweight API call to verify the key works
            await stripe.balance.retrieve()

            // Update database with validation status
            const tableName = type === 'province' ? 'provinces' : type === 'county' ? 'counties' : type === 'team' ? 'adventure_teams' : 'groups'

            const { error: updateError } = await supabase
                .from(tableName)
                .update({
                    stripe_keys_validated: true,
                    stripe_keys_validated_at: new Date().toISOString(),
                })
                .eq('id', id)

            if (updateError) {
                console.error('Failed to update validation status:', updateError)
                // Don't fail the request if DB update fails, keys are still valid
            }

            return NextResponse.json({
                valid: true,
                environment: isTestKey ? 'test' : 'live',
                message: 'Stripe keys validated successfully'
            })

        } catch (stripeError: any) {
            // Mark as invalid in database
            const tableName = type === 'province' ? 'provinces' : type === 'county' ? 'counties' : type === 'team' ? 'adventure_teams' : 'groups'

            await supabase
                .from(tableName)
                .update({
                    stripe_keys_validated: false,
                    stripe_keys_validated_at: null,
                })
                .eq('id', id)

            return NextResponse.json({
                valid: false,
                error: stripeError.message || 'Invalid Stripe secret key'
            }, { status: 200 })
        }

    } catch (error: any) {
        console.error('Stripe validation error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to validate Stripe keys' },
            { status: 500 }
        )
    }
}
