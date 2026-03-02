import { APP_CONFIG } from '../config/app-config';
import { SyncPayload, SyncEntityType, SyncAction, SyncResponse } from './types';
import { generateSignature } from './sync-utils';

/**
 * Syncs a standalone Atlas instance's configuration to the Hub.
 */
export async function syncToHub(
    type: SyncEntityType,
    action: SyncAction,
    data: any
): Promise<SyncResponse> {
    const hubUrl = APP_CONFIG.hubUrl;
    const syncToken = APP_CONFIG.syncToken;

    if (!hubUrl || !syncToken) {
        return { success: false, error: 'Hub URL or Sync Token not configured' };
    }

    const instanceUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    const payload: Omit<SyncPayload, 'signature'> = {
        type,
        action,
        data,
        source: {
            groupId: APP_CONFIG.homeOrgId || '',
            groupName: data.name || data.site_title || '',
            instanceUrl: instanceUrl,
        },
        timestamp: new Date().toISOString(),
    };

    const signature = generateSignature(payload, syncToken);

    try {
        const response = await fetch(`${hubUrl}/api/sync/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-atlas-signature': signature,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `Hub responded with ${response.status}: ${errorText}` };
        }

        return await response.json();
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Specifically syncs organization metadata to the Hub.
 */
export async function syncOrganizationToHub(orgData: any) {
    return syncToHub('organization', 'upsert', orgData);
}
