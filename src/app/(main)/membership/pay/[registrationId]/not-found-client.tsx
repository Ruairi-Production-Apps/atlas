'use client'

import { useState } from 'react'

export function PaymentNotFoundClient() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRequest = async () => {
        if (!email) return
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/membership/pay/resend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({ email }),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to send link')
            }
            setSent(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 w-full py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
                {sent ? (
                    <>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                            <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
                        <p className="mt-2 text-gray-600">
                            If we found a pending payment for that address, a new link has been sent.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
                            <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Link Not Found</h1>
                        <p className="mt-2 text-gray-600">
                            This payment link is invalid or has expired. Enter your email below to receive a new one.
                        </p>
                        <div className="mt-6 space-y-3">
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleRequest()}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
                            />
                            {error && (
                                <p className="text-sm text-red-600">{error}</p>
                            )}
                            <button
                                onClick={handleRequest}
                                disabled={loading || !email}
                                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                            >
                                {loading ? 'Sending...' : 'Send New Payment Link'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
