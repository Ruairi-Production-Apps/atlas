import { SyncPayload, SyncEntityType, SyncAction, SyncResponse } from './types';
import { generateSignature } from './sync-utils';

/**
 * Sync Service for Atlas Instances
 */
export async function syncToHub(
    type: SyncEntityType,
    action: SyncAction,
    data: any
): Promise<SyncResponse> {
    const role = process.env.NEXT_PUBLIC_APP_ROLE;
    const hubUrl = process.env.ATLAS_HUB_URL;
    const token = process.env.ATLAS_SYNC_TOKEN;
    const homeOrgId = process.env.NEXT_PUBLIC_HOME_ORG_ID;

    // Only sync if in instance mode and configured
    if (role !== 'instance' || !hubUrl || !token) {
        return { success: true, message: 'Sync skipped: Not in instance mode or no hub configured.' };
    }

    try {
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
