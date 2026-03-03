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

    // 4. Clear cache and redirect
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
