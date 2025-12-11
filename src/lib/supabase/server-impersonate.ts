import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

async function getImpersonationData() {
    const cookieStore = await cookies()
    const token = cookieStore.get('impersonation_token')?.value

    if (!token) return null

    try {
        const secret = new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY!)
        const { payload } = await jwtVerify(token, secret)
        return payload as { admin_id: string; target_id: string }
    } catch (e) {
        // Token invalid or expired
        return null
    }
}

/**
 * Get the current user, accounting for impersonation
 * Returns the impersonated user if impersonation is active, otherwise the real user
 */
export async function getCurrentUser() {
    const supabase = await createClient()
    const impersonationData = await getImpersonationData()

    if (impersonationData?.target_id) {
        // Return impersonated user
        // Use admin client to fetch user by ID since we are trusted server-side context
        // But commonly createClient() is standard context. 
        // We probably need to use admin.getUserById here?
        // Original code used `supabase.auth.admin.getUserById(impersonateUserId)`
        // NOTE: createClient() in `lib/supabase/server` typically creates a standard client.
        // `supabase.auth.admin` is only available on service_role client.
        // Let's assume createClient() returns a client that *might* not be admin unless configured.
        // But usually server components use the cookie-based client.
        // To fetch *another* user, we definitely need the service role client (createAdminClient).
        // The original code used `supabase.auth.admin`. This implies `createClient` was returning an admin client?
        // Let's check imports. It imported `createClient` from `@/lib/supabase/server`.
        // That usually uses `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
        // So `auth.admin` would fail unless `createClient` logic is special.
        // Actually, previous code: `await supabase.auth.admin.getUserById`.
        // If that worked, then `createClient` uses service role? Or maybe the user *is* an admin?
        // But "impersonated user" implies fetching a DIFFERENT user. Only Service Role can do `getUserById` for anyone.
        // Let's stick to what was there, but maybe import `createAdminClient` if needed.
        // Checking original: `const { data: { user } } = await supabase.auth.admin.getUserById(impersonateUserId)`
        // If `supabase` is the standard cookie client, this line *should* throw if strict, or fail.
        // Unless `createClient` wraps `createAdminClient`?
        // I'll stick to logic but safest is to use `createAdminClient` if available.
        // I will import `createAdminClient` from `@/lib/supabase/admin` if it exists.
        // I saw it imported in the route handler.

        // Wait, the original code had: `const { data: { user } } = await supabase.auth.admin.getUserById(impersonateUserId)`
        // I'll keep it, but add `createAdminClient` import to be safe if `supabase.auth.admin` is undefined on standard client.

        // Let's assume standard client for now to minimize changes, but I suspect I need admin client.
        // Actually, I'll use `createAdminClient` which I know exists from the route file.
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = createAdminClient()
        const { data: { user } } = await adminClient.auth.admin.getUserById(impersonationData.target_id)
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
    const impersonationData = await getImpersonationData()
    if (!impersonationData?.admin_id) return null

    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    const { data: { user } } = await adminClient.auth.admin.getUserById(impersonationData.admin_id)
    return user
}

/**
 * Check if impersonation is active
 */
export async function isImpersonating() {
    const data = await getImpersonationData()
    return !!data?.target_id
}

