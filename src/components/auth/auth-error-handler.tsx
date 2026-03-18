"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
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
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    useEffect(() => {
        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                router.push('/reset-password')
            }
        })

        const error = searchParams.get('error')
        const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')
        const message = searchParams.get('message')
        const success = searchParams.get('success')

        if (error || errorCode || errorDescription || message || success) {
            // Determine the message to show
            let title = 'Authentication'
            let description = ''
            let variant: 'default' | 'destructive' = 'default'

            if (error || errorCode || errorDescription) {
                title = 'Authentication Error'
                description = errorDescription || error || 'An error occurred during authentication'
                variant = 'destructive'

                // Provide user-friendly messages for common error codes
                if (errorCode === 'otp_expired') {
                    title = 'Link Expired'
                    description = 'This confirmation link has expired. Please request a new one.'
                } else if (errorCode === 'access_denied') {
                    title = 'Access Denied'
                    description = errorDescription || 'Authentication was denied or the link is invalid.'
                }
            } else if (message || success) {
                title = 'Success'
                description = message || success || 'Operation completed successfully'
                variant = 'default'
            }

            // Show the toast
            toast({
                title,
                description,
                variant,
                duration: 8000, // Show for 8 seconds so user has time to read
            })

            // Clean the URL by removing error and message parameters
            const timeout = setTimeout(() => {
                if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href)
                    if (url.searchParams.has('error') ||
                        url.searchParams.has('error_code') ||
                        url.searchParams.has('error_description') ||
                        url.searchParams.has('message') ||
                        url.searchParams.has('success') ||
                        url.hash) {

                        url.searchParams.delete('error')
                        url.searchParams.delete('error_code')
                        url.searchParams.delete('error_description')
                        url.searchParams.delete('message')
                        url.searchParams.delete('success')
                        url.hash = '' // Also clear hash params
                        window.history.replaceState({}, '', url.toString())
                    }
                }
            }, 500)

            return () => {
                clearTimeout(timeout)
                subscription.unsubscribe()
            }
        }

        return () => subscription.unsubscribe()
    }, [searchParams, toast, router])

    return null // This component doesn't render anything
}
