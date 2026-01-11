"use client"

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

/**
 * Global component to handle auth errors from URL parameters
 * 
 * Supabase redirects back to the site with error parameters when:
 * - Email confirmation links expire
 * - Magic links are invalid
 * - OAuth flows fail
 * 
 * This component detects these errors and shows them to the user via toast.
 */
export function AuthErrorHandler() {
    const searchParams = useSearchParams()
    const { toast } = useToast()

    useEffect(() => {
        const error = searchParams.get('error')
        const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')

        if (error || errorCode || errorDescription) {
            // Determine the message to show
            let title = 'Authentication Error'
            let description = errorDescription || error || 'An error occurred during authentication'

            // Provide user-friendly messages for common error codes
            if (errorCode === 'otp_expired') {
                title = 'Link Expired'
                description = 'This confirmation link has expired. Please request a new one.'
            } else if (errorCode === 'access_denied') {
                title = 'Access Denied'
                description = errorDescription || 'Authentication was denied or the link is invalid.'
            }

            // Show the error toast
            toast({
                title,
                description,
                variant: 'destructive',
                duration: 8000, // Show for 8 seconds so user has time to read
            })

            // Clean the URL by removing error parameters
            // We use window.history.replaceState to avoid triggering a navigation/reload
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href)
                url.searchParams.delete('error')
                url.searchParams.delete('error_code')
                url.searchParams.delete('error_description')
                url.hash = '' // Also clear hash params
                window.history.replaceState({}, '', url.toString())
            }
        }
    }, [searchParams, toast])

    return null // This component doesn't render anything
}
