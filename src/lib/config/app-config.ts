/**
 * Application Role Configuration
 *
 * This file defines the behavior of the application based on the environment.
 * The application can run in two modes:
 * 1. 'hub' - The central directory and content aggregator.
 * 2. 'instance' - A distributed, self-hosted group management tool.
 */

export type AppRole = 'hub' | 'instance';

export const APP_CONFIG = {
    role: (process.env.NEXT_PUBLIC_APP_ROLE as AppRole) || 'instance',
    homeOrgId: process.env.NEXT_PUBLIC_HOME_ORG_ID,
    hubUrl: process.env.ATLAS_HUB_URL,
    syncToken: process.env.ATLAS_SYNC_TOKEN,
};

export const isHub = () => APP_CONFIG.role === 'hub';
export const isInstance = () => APP_CONFIG.role === 'instance';

/**
 * Validates that the configuration is correct for the current role.
 */
export function validateConfig() {
    if (isInstance() && !APP_CONFIG.homeOrgId) {
        console.warn('WARNING: Running in instance mode but NEXT_PUBLIC_HOME_ORG_ID is not set.');
    }
}
