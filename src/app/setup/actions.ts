"use server"

import { createClient } from "@/lib/supabase/server"
import { SiteSettings, updateSiteSettings } from "@/lib/supabase/queries"
import { checkDatabaseHealth, initializeDatabaseSchema } from "@/lib/supabase/db-init"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type SetupStage = 'type' | 'details' | 'sync' | 'complete';

export interface SetupData {
    orgType: 'group' | 'county' | 'province' | 'adventure_team'
    orgId: string
    name: string
    slug: string
    siteTitle: string
    syncEnabled: boolean
}

export async function initializeInstance(data: SetupData) {
    const supabase = await createClient()

    // Ensure the user is a sysadmin (or at least logged in for setup)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Authentication required for setup")

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

        // Insert new organization record
        const { data: newOrg, error: orgError } = await supabase
            .from(table)
            .insert({
                name: data.name,
                slug: data.slug,
            })
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
                scope_id: data.orgId,
                site_title: data.siteTitle,
                sync_enabled: data.syncEnabled,
                is_initialized: true
            })
            .select()
            .single()

        if (insertError) throw insertError
        result = inserted
    }

    // 2. We should ideally also assign the current user as an admin for this org if not already
    // This depends on the user_roles table structure.

    // 3. Clear cache and redirect
    revalidatePath('/')
    return result
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
