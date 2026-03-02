import { addWeeks, addMonths, differenceInWeeks, differenceInMonths, isAfter, startOfDay, endOfDay } from 'date-fns'

export interface PaymentScheduleItem {
    due_date: string
    amount: number
}

export function generatePaymentSchedule(
    totalAmount: number,
    method: 'full' | 'weekly' | 'monthly' | 'tiered',
    config: {
        schedule_start_date: string | null
        schedule_end_date: string | null
        rounding_mode: 'final_payment' | 'distribute'
        tiered_initial_amount?: number
        tiered_final_date?: string | null
    }
): PaymentScheduleItem[] {
    const schedule: PaymentScheduleItem[] = []
    const now = new Date()

    if (method === 'full') {
        schedule.push({
            due_date: now.toISOString(),
            amount: totalAmount
        })
        return schedule
    }

    if (method === 'tiered') {
        const initial = config.tiered_initial_amount || 0
        const finalDate = config.tiered_final_date ? new Date(config.tiered_final_date) : now

        schedule.push({
            due_date: now.toISOString(),
            amount: initial
        })

        if (totalAmount > initial) {
            schedule.push({
                due_date: finalDate.toISOString(),
                amount: totalAmount - initial
            })
        }
        return schedule
    }

    // Weekly or Monthly
    const startDate = config.schedule_start_date ? new Date(config.schedule_start_date) : now
    const endDate = config.schedule_end_date ? new Date(config.schedule_end_date) : addMonths(now, 6)

    // If start date is in the past, use now (or first possible date)
    const activeStartDate = isAfter(startDate, now) ? startDate : now

    let installments = 0
    if (method === 'weekly') {
        installments = Math.max(1, differenceInWeeks(endDate, activeStartDate) + 1)
    } else {
        installments = Math.max(1, differenceInMonths(endDate, activeStartDate) + 1)
    }

    const baseAmount = Math.floor((totalAmount / installments) * 100) / 100
    let remainingAmount = totalAmount

    for (let i = 0; i < installments; i++) {
        const dueDate = method === 'weekly'
            ? addWeeks(activeStartDate, i)
            : addMonths(activeStartDate, i)

        let amount = baseAmount

        // Handle last installment or distribution
        if (i === installments - 1) {
            amount = Math.round(remainingAmount * 100) / 100
        } else if (config.rounding_mode === 'distribute') {
            // Distribute extra cents across early payments? 
            // Simplified: just use baseAmount and final_payment for this helper for now
        }

        schedule.push({
            due_date: dueDate.toISOString(),
            amount: amount
        })
        remainingAmount -= amount
    }

    return schedule
}
