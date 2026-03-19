"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { SiteSettings, updateSiteSettings } from "@/lib/supabase/queries"
import { checkDatabaseHealth, initializeDatabaseSchema } from "@/lib/supabase/db-init"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { syncOrganizationToHub } from "@/lib/sync/sync-client"

export type SetupStage = 'type' | 'details' | 'sync' | 'complete';

export interface SetupData {
    orgType: 'group' | 'county' | 'province' | 'adventure_team'
    orgId: string
    name: string
    slug: string
    siteTitle: string
    syncEnabled: boolean
    // Admin credentials
    adminEmail?: string
    adminPassword?: string
    adminName?: string
}

export async function initializeInstance(data: SetupData) {
    const supabase = createAdminClient()

    // 1. Ensure the Organization record exists locally
    let orgId = data.orgId;

    if (!orgId) {
        let table = '';
        switch (data.orgType) {
            case 'group': table = 'groups'; break;
            case 'county': table = 'counties'; break;
            case 'province': table = 'provinces'; break;
            case 'adventure_team': table = 'adventure_teams'; break;
        }

        // Upsert organization record (in case it partially created before)
        const { data: newOrg, error: orgError } = await supabase
            .from(table)
            .upsert({
                name: data.name,
                slug: data.slug,
            }, { onConflict: 'slug' })
            .select('id')
            .single();

        if (orgError) throw new Error(`Failed to create organization record: ${orgError.message}`);
        orgId = newOrg.id;
    }

    // 2. Create or Check Site Settings (and use the orgId)
    const { data: existingSettings, error: fetchError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('scope_type', data.orgType)
        .eq('scope_id', orgId)
        .maybeSingle()

    if (fetchError) throw fetchError

    let result;
    if (existingSettings) {
        // Update
        const { data: updated, error: updateError } = await supabase
            .from('site_settings')
            .update({
                site_title: data.siteTitle,
                sync_enabled: data.syncEnabled,
                is_initialized: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingSettings.id)
            .select()
            .single()

        if (updateError) throw updateError
        result = updated
    } else {
        // Insert
        const { data: inserted, error: insertError } = await supabase
            .from('site_settings')
            .insert({
                scope_type: data.orgType,
                scope_id: orgId,
                site_title: data.siteTitle,
                sync_enabled: data.syncEnabled,
                is_initialized: true
            })
            .select()
            .single()

        if (insertError) throw insertError
        result = inserted
    }

    // 3. Sync to Hub if enabled (Non-blocking)
    if (data.syncEnabled) {
        // We trigger this without 'await' so the UI doesn't hang if the Hub is slow
        syncOrganizationToHub({
            id: orgId,
            name: data.name,
            type: data.orgType,
            slug: data.slug,
            url: process.env.NEXT_PUBLIC_APP_URL || '',
            site_title: data.siteTitle,
        }).catch(syncError => {
            console.error('Background Hub Sync Error:', syncError);
        });
    }

    // 4. Force a schema cache reload before role assignment to prevent PGRST errors
    await supabase.rpc('exec_sql', { sql: "NOTIFY pgrst, 'reload schema';" });
    await new Promise(resolve => setTimeout(resolve, 500));

    // 5. Create Admin Account if provided
    if (data.adminEmail && data.adminPassword) {
        // First check if a sysadmin already exists to prevent double-creation
        const { count } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'sysadmin');

        if ((count || 0) === 0) {
            const firstName = data.adminName?.split(' ')[0] || 'System'
            const lastName = data.adminName?.split(' ').slice(1).join(' ') || 'Administrator'

            let userId: string | null = null

            // Try to create the auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: data.adminEmail,
                password: data.adminPassword,
                email_confirm: true,
                user_metadata: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: data.adminName || `${firstName} ${lastName}`
                }
            })

            if (authError) {
                // If user already exists (e.g. from a previous setup attempt), look them up
                if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
                    const { data: existingUsers } = await supabase.auth.admin.listUsers()
                    const existing = existingUsers?.users?.find(u => u.email === data.adminEmail)
                    if (existing) {
                        userId = existing.id
                    } else {
                        throw new Error(`Failed to create admin user: ${authError.message}`)
                    }
                } else {
                    throw new Error(`Failed to create admin user: ${authError.message}`)
                }
            } else {
                userId = authData.user?.id || null
            }

            if (userId) {
                // Upsert the sysadmin role (safe for re-runs)
                const { error: roleError } = await supabase
                    .from('user_roles')
                    .upsert({
                        user_id: userId,
                        role: 'sysadmin',
                        scope_type: 'system',
                        scope_id: null
                    }, { onConflict: 'user_id,role,scope_type,scope_id' })

                if (roleError) {
                    throw new Error(`Failed to assign admin role: ${roleError.message}`)
                }

                // Also ensure profile exists
                await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        email: data.adminEmail,
                        full_name: data.adminName || `${firstName} ${lastName}`,
                    }, { onConflict: 'id' })
            }
        }
    }

    // 5. Clear cache and redirect
    revalidatePath('/')
    return result
}

export async function checkSysadminExists() {
    const supabase = createAdminClient()
    try {
        // Force a fresh check
        const { count, error } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'sysadmin')

        if (error) {
            console.error('checkSysadminExists Error:', error)
            // If table doesn't exist, we definitely don't have a sysadmin
            if (error.code === 'PGRST116' || error.message.includes('not find the table') || error.code === '42P01') {
                return false
            }
            throw error
        }
        return (count || 0) > 0
    } catch (e) {
        console.warn('Silent failure in checkSysadminExists:', e)
        return false
    }
}

export async function getOrganizationsByType(type: string) {
    const supabase = await createClient()
    let table = ''
    switch (type) {
        case 'group': table = 'groups'; break;
        case 'county': table = 'counties'; break;
        case 'province': table = 'provinces'; break;
        case 'adventure_team': table = 'adventure_teams'; break;
        default: throw new Error("Invalid organization type")
    }

    const { data, error } = await supabase
        .from(table)
        .select('id, name, slug, logo_url')
        .order('name')

    if (error) throw error
    return data || []
}

export async function getDbStatus() {
    return await checkDatabaseHealth()
}

export async function runDbInitialization() {
    return await initializeDatabaseSchema()
}

export async function runDbReset() {
    const { resetDatabaseSchema } = await import("@/lib/supabase/db-init")
    return await resetDatabaseSchema()
}
