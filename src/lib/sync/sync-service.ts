import { SyncPayload, SyncEntityType, SyncAction, SyncResponse } from './types';
import { generateSignature } from './sync-utils';
import { APP_CONFIG } from '../config/app-config';
import { getSiteSettings } from '../supabase/queries'

/**
 * Sync Service for Atlas Instances
 */
export async function syncToHub(
    type: SyncEntityType,
    action: SyncAction,
    data: any
): Promise<SyncResponse> {
    const role = APP_CONFIG.role;
    const hubUrl = APP_CONFIG.hubUrl;
    const token = APP_CONFIG.syncToken;
    const homeOrgId = APP_CONFIG.homeOrgId;
    const homeOrgType = APP_CONFIG.homeOrgType;

    // Only sync if in instance mode and configured
    if (role !== 'instance' || !hubUrl || !token || !homeOrgId || !homeOrgType) {
        return { success: true, message: 'Sync skipped: Not in instance mode or no hub configured.' };
    }

    try {
        // Data Isolation Guardrail: Check if sync is enabled in settings
        const settings = await getSiteSettings(homeOrgType, homeOrgId);
        if (!settings || !settings.sync_enabled) {
            return { success: true, message: 'Sync skipped: Synchronization is disabled in settings.' };
        }

        const payload: Omit<SyncPayload, 'signature'> = {
            type,
            action,
            data,
            source: {
                groupId: homeOrgId || 'unknown',
                groupName: 'Unknown Group', // We could fetch this if needed
                instanceUrl: process.env.NEXT_PUBLIC_SITE_URL || 'unknown',
            },
            timestamp: new Date().toISOString(),
        };

        const signature = generateSignature(payload, token);

        const response = await fetch(`${hubUrl}/api/sync/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-atlas-signature': signature,
            },
            body: JSON.stringify({ ...payload, signature }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to sync to hub');
        }

        return await response.json();
    } catch (error: any) {
        console.error('[Sync Service Error]:', error);
        return { success: false, error: error.message };
    }
}
