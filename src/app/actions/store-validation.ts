'use server'

import { createClient } from '@/lib/supabase/server'

interface ValidationResult {
    isValid: boolean
    message?: string
}

export async function validateStoreReadiness(
    scopeType: 'province' | 'county' | 'group' | 'team',
    scopeId: string
): Promise<ValidationResult> {
    const supabase = await createClient()

    // improved table name logic
    let tableName = ''
    switch (scopeType) {
        case 'county': tableName = 'counties'; break;
        case 'province': tableName = 'provinces'; break;
        case 'group': tableName = 'groups'; break;
        case 'team': tableName = 'adventure_teams'; break;
        default: tableName = `${scopeType}s`; // fallback
    }

    try {
        // 1. Check Stripe Connection
        const { data: org, error } = await supabase
            .from(tableName as any)
            .select('stripe_account_id')
            .eq('id', scopeId)
            .single()

        if (error || !org) {
            console.error('Error fetching organization for validation:', error)
            return { isValid: false, message: 'Could not fetch organization details.' }
        }

        const hasConnect = !!org.stripe_account_id

        if (!hasConnect) {
            // 2. Enforce: Unpublish all active products if keys are missing
            const { error: updateError } = await supabase
                .from('store_products')
                .update({ published: false })
                .eq('scope_type', scopeType)
                .eq('scope_id', scopeId)
                .eq('published', true)

            if (updateError) {
                console.error('Error unpublishing products:', updateError)
            }

            return {
                isValid: false,
                message: 'Stripe Connect is not configured. Products have been unpublished.'
            }
        }

        return { isValid: true }

    } catch (error) {
        console.error('Store validation error:', error)
        return { isValid: false, message: 'An unexpected error occurred.' }
    }
}
