'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface PaidSchedule {
    amount: number
    paid_at: string | null
}

interface MembershipPaymentClientProps {
    registrationId: string
    magicLinkToken?: string | null
    isExpired: boolean
    groupId: string
    groupName: string
    parentFirstName: string
    parentName: string
    childNames: string
    totalFee: number
    totalPaid: number
    remainingBalance: number
    minPayment: number
    hasStripe: boolean
    paidSchedules: PaidSchedule[]
    paymentStatus: string
    groupLogo?: string | null
}

export function MembershipPaymentClient({
    registrationId,
    magicLinkToken,
    isExpired,
    groupId,
    groupName,
    groupLogo,
    parentFirstName,
    parentName,
    childNames,
    totalFee,
    totalPaid,
    remainingBalance,
    minPayment,
    hasStripe,
    paidSchedules,
    paymentStatus,
}: MembershipPaymentClientProps) {
    const searchParams = useSearchParams()
    const cancelled = searchParams.get('cancelled')

    const [amount, setAmount] = useState(Math.min(remainingBalance, remainingBalance))
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [resent, setResent] = useState(false)
    const [error, setError] = useState<string | null>(cancelled ? 'Payment was cancelled. You can try again below.' : null)

    const isPaidInFull = paymentStatus === 'paid' || remainingBalance <= 0

    // Auto-resend if expired
    useEffect(() => {
        if (isExpired && !resent && !resending) {
            handleResend()
        }
    }, [isExpired])

    const handleResend = async () => {
        setResending(true)
        setError(null)
        try {
            const response = await fetch('/api/membership/pay/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId, magicLinkToken }),
            })
            if (!response.ok) throw new Error('Failed to resend link')
            setResent(true)
        } catch (err: any) {
            setError('We tried to send you a fresh link but failed. Please contact your group leader.')
        } finally {
            setResending(false)
        }
    }

    const handlePay = async () => {
        if (amount < minPayment) {
            setError(`Minimum payment is €${minPayment.toFixed(2)}`)
            return
        }
        if (amount > remainingBalance + 0.01) {
            setError(`Amount exceeds remaining balance (€${remainingBalance.toFixed(2)})`)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/organizations/group/${groupId}/membership/create-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({ registration_id: registrationId, amount }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment session')
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('No checkout URL returned')
            }
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="max-w-lg mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    {groupLogo ? (
                        <img
                            src={groupLogo}
                            alt={groupName}
                            className="inline-block h-20 w-auto mb-4 object-contain"
                        />
                    ) : (
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                            <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">{groupName}</h1>
                    <p className="text-gray-500 mt-1">Membership Payment</p>
                </div>

                {isExpired ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
                            <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Link Expired</h2>
                        <p className="text-gray-600 mt-2">
                            For your security, payment links are only valid for 24 hours.
                        </p>

                        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                            {resending ? (
                                <div className="flex items-center justify-center gap-2 text-emerald-700">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span className="font-medium text-sm">Sending you a fresh link...</span>
                                </div>
                            ) : resent ? (
                                <div className="text-emerald-700">
                                    <p className="font-semibold text-sm">A new payment link has been sent!</p>
                                    <p className="text-xs mt-1">Please check your email and click the new link to continue.</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline"
                                >
                                    Click here to send a new link
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Main Card */
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Greeting */}
                        <div className="px-6 pt-6 pb-4">
                            <p className="text-lg text-gray-900">
                                Hi <span className="font-semibold">{parentFirstName}</span> 👋
                            </p>
                            {childNames && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Payment for: {childNames}
                                </p>
                            )}
                        </div>

                        {/* Balance Summary */}
                        <div className="px-6 py-4 bg-gray-50 border-y border-gray-100">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Fee</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">€{totalFee.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Paid</p>
                                    <p className="text-lg font-semibold text-emerald-600 mt-1">€{totalPaid.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Balance</p>
                                    <p className={`text-lg font-semibold mt-1 ${remainingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        €{remainingBalance.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isPaidInFull ? (
                            /* Paid in Full */
                            <div className="px-6 py-8 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
                                    <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Paid in Full</h2>
                                <p className="text-gray-500 mt-1">Thank you! Your membership fees are fully paid.</p>
                            </div>
                        ) : !hasStripe ? (
                            /* No Stripe */
                            <div className="px-6 py-8 text-center">
                                <p className="text-gray-600">
                                    Online payments are not yet available for this group. Please contact your group leader for payment options.
                                </p>
                            </div>
                        ) : (
                            /* Payment Form */
                            <div className="px-6 py-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Amount (€)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                                        <input
                                            type="number"
                                            min={minPayment}
                                            max={remainingBalance}
                                            step="0.01"
                                            value={amount}
                                            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                        Minimum payment: €{minPayment.toFixed(2)} · You can pay any amount up to €{remainingBalance.toFixed(2)}
                                    </p>
                                </div>

                                {/* Quick amount buttons */}
                                {remainingBalance > minPayment && (
                                    <div className="flex gap-2">
                                        {remainingBalance > 50 && (
                                            <button
                                                onClick={() => setAmount(50)}
                                                className="flex-1 py-2 px-3 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                                            >
                                                €50
                                            </button>
                                        )}
                                        {remainingBalance > 100 && (
                                            <button
                                                onClick={() => setAmount(100)}
                                                className="flex-1 py-2 px-3 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                                            >
                                                €100
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setAmount(remainingBalance)}
                                            className="flex-1 py-2 px-3 text-sm font-medium rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                        >
                                            Pay Full Balance
                                        </button>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handlePay}
                                    disabled={loading || amount < minPayment || amount > remainingBalance + 0.01}
                                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Redirecting to Stripe...
                                        </>
                                    ) : (
                                        <>Pay €{amount.toFixed(2)} Now</>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    Secure payment via Stripe
                                </div>
                            </div>
                        )}

                        {/* Payment History */}
                        {paidSchedules.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment History</h3>
                                <div className="space-y-2">
                                    {paidSchedules.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">
                                                {s.paid_at
                                                    ? new Date(s.paid_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : 'Payment recorded'}
                                            </span>
                                            <span className="font-medium text-emerald-600">€{s.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Powered by Scout Hub · Payments secured by Stripe
                </p>
            </div>
        </div>
    )
}
