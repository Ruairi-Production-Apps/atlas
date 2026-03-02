/**
 * Sync Protocol Types
 */

export type SyncEntityType = 'news' | 'event' | 'knowledgebase' | 'organization';
export type SyncAction = 'upsert' | 'delete';

export interface SyncSource {
    groupId: string;
    groupName: string;
    instanceUrl: string;
}

export interface SyncPayload {
    type: SyncEntityType;
    action: SyncAction;
    data: any; // The full object from the DB
    source: SyncSource;
    timestamp: string;
    signature: string; // HMAC of the payload using ATLAS_SYNC_TOKEN
}

export interface SyncResponse {
    success: boolean;
    message?: string;
    error?: string;
}
