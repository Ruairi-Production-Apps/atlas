import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Get the current user, accounting for impersonation
 * Returns the impersonated user if impersonation is active, otherwise the real user
 */
export async function getCurrentUser() {
    const supabase = await createClient()
    const cookieStore = await cookies()
    
    const impersonateUserId = cookieStore.get('impersonate_user_id')?.value
    
    if (impersonateUserId) {
        // Return impersonated user
        const { data: { user } } = await supabase.auth.admin.getUserById(impersonateUserId)
        return user
    }
    
    // Return real user
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

/**
 * Get the admin user who is impersonating (if any)
 */
export async function getAdminUser() {
    const cookieStore = await cookies()
    const impersonateAdminId = cookieStore.get('impersonate_admin_id')?.value
    
    if (!impersonateAdminId) return null
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.admin.getUserById(impersonateAdminId)
    return user
}

/**
 * Check if impersonation is active
 */
export async function isImpersonating() {
    const cookieStore = await cookies()
    return !!cookieStore.get('impersonate_user_id')?.value
}

