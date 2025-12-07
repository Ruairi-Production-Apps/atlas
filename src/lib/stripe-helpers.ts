/**
 * Stripe helper functions for payment processing
 */

// European Stripe fees: 1.4% + €0.25 per transaction
const STRIPE_PERCENTAGE_FEE = 0.014 // 1.4%
const STRIPE_FIXED_FEE = 0.25 // €0.25

/**
 * Calculate Stripe fee for a given amount
 * @param amount Amount in euros
 * @returns Fee amount in euros
 */
export function calculateStripeFee(amount: number): number {
    return (amount * STRIPE_PERCENTAGE_FEE) + STRIPE_FIXED_FEE
}

/**
 * Calculate net amount after Stripe fees
 * @param amount Gross amount in euros
 * @returns Net amount after fees in euros
 */
export function calculateNetAmount(amount: number): number {
    const fee = calculateStripeFee(amount)
    return amount - fee
}

/**
 * Calculate total price based on event pricing mode and participants
 * @param event Event with pricing information
 * @param participants Array of participants from form submission
 * @returns Total price in euros
 */
export function calculateTotalPrice(
    event: {
        pricing_mode: 'per_group' | 'per_scout' | 'per_person_type' | null
        price: number | null
        price_scouter: number | null
        price_youth: number | null
    },
    participants: Array<{ type?: string }> | null
): number {
    if (!event.pricing_mode) return 0

    switch (event.pricing_mode) {
        case 'per_group':
            return event.price || 0

        case 'per_scout': {
            if (!participants) return 0
            const youthCount = participants.filter(p => p.type === 'youth_member').length
            return youthCount * (event.price || 0)
        }

        case 'per_person_type': {
            if (!participants) return 0
            const scouterCount = participants.filter(p => p.type === 'scouter').length
            const youthCount = participants.filter(p => p.type === 'youth_member').length
            return (scouterCount * (event.price_scouter || 0)) + (youthCount * (event.price_youth || 0))
        }

        default:
            return 0
    }
}

/**
 * Format currency amount in euros
 * @param amount Amount in euros
 * @returns Formatted string (e.g., "€12.50")
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount)
}

/**
 * Convert euros to cents for Stripe
 * @param euros Amount in euros
 * @returns Amount in cents
 */
export function eurosToCents(euros: number): number {
    return Math.round(euros * 100)
}

/**
 * Convert cents to euros
 * @param cents Amount in cents
 * @returns Amount in euros
 */
export function centsToEuros(cents: number): number {
    return cents / 100
}
