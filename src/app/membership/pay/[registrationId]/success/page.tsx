import Link from 'next/link'

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="max-w-md mx-auto px-4 text-center">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                        <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
                    <p className="text-gray-500 mt-2">
                        Thank you for your payment. A receipt has been sent to your email by Stripe.
                    </p>

                    <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="text-sm text-emerald-700">
                            Your payment has been recorded and your balance has been updated.
                        </p>
                    </div>

                    <p className="text-xs text-gray-400 mt-6">
                        You can close this window.
                    </p>
                </div>
            </div>
        </div>
    )
}
