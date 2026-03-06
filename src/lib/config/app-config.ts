/**
 * Application Role Configuration
 *
 * This file defines the behavior of the application based on the environment.
 * The application can run in two modes:
 * 1. 'hub' - The "Atlas Hub": A central directory and content aggregator.
 * 2. 'instance' - An "Atlas" Instance: A distributed, self-hosted group management tool.
 */

export type AppRole = 'hub' | 'instance';

export const APP_CONFIG = {
    role: (process.env.NEXT_PUBLIC_APP_ROLE as AppRole) || 'instance',
    homeOrgId: process.env.NEXT_PUBLIC_HOME_ORG_ID,
    homeOrgType: process.env.NEXT_PUBLIC_HOME_ORG_TYPE as 'group' | 'county' | 'province' | 'adventure_team' | undefined,
    hubUrl: process.env.ATLAS_HUB_URL,
    syncToken: process.env.ATLAS_SYNC_TOKEN,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://atlashub.ie',
};

/**
 * Gets the current site URL, handling different environments (Vercel, Local, Stage)
 */
export function getSiteUrl() {
    // If we're on the client, use window.location.origin
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // In Vercel environments, prioritize VERCEL_URL if NEXT_PUBLIC_SITE_URL isn't set
    // or if we're in a preview/staging branch
    if (process.env.NEXT_PUBLIC_VERCEL_URL && !process.env.NEXT_PUBLIC_SITE_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }

    return APP_CONFIG.siteUrl;
}

export const isHub = () => APP_CONFIG.role === 'hub';
export const isInstance = () => APP_CONFIG.role === 'instance';

/**
 * Validates that the configuration is correct for the current role.
 */
export function validateConfig() {
    if (isInstance() && (!APP_CONFIG.homeOrgId || !APP_CONFIG.homeOrgType)) {
        console.warn('WARNING: Running in instance mode but organization identification is incomplete (ID or Type missing).');
    }
}
