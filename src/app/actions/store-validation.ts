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
        // 1. Check Stripe Keys
        const { data: org, error } = await supabase
            .from(tableName)
            .select('stripe_private_key')
            .eq('id', scopeId)
            .single()

        if (error || !org) {
            console.error('Error fetching organization for validation:', error)
            return { isValid: false, message: 'Could not fetch organization details.' }
        }

        const hasKey = !!org.stripe_private_key

        if (!hasKey) {
            // 2. Enforce: Unpublish all active products if keys are missing
            const { error: updateError } = await supabase
                .from('store_products')
                .update({ published: false })
                .eq('scope_type', scopeType)
                .eq('scope_id', scopeId)
                .eq('published', true)

            if (updateError) {
                console.error('Error unpublishing products:', updateError)
                // We still return false because keys are missing, even if unpublish failed
            }

            return {
                isValid: false,
                message: 'Stripe payments are not configured. Products have been unpublished.'
            }
        }

        return { isValid: true }

    } catch (error) {
        console.error('Store validation error:', error)
        return { isValid: false, message: 'An unexpected error occurred.' }
    }
}
