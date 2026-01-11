/**
 * Logger utility for consistent logging across the application
 * 
 * In development: All log levels are shown
 * In production: Only info, warn, and error are shown (debug is suppressed)
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
    /**
     * Debug-level logging (development only)
     * Use for verbose debugging information
     */
    debug: (...args: unknown[]) => {
        if (isDevelopment) {
            console.log('[DEBUG]', ...args)
        }
    },

    /**
     * Info-level logging (all environments)
     * Use for important application events
     */
    info: (...args: unknown[]) => {
        console.log('[INFO]', ...args)
    },

    /**
     * Warning-level logging (all environments)
     * Use for potentially problematic situations
     */
    warn: (...args: unknown[]) => {
        console.warn('[WARN]', ...args)
    },

    /**
     * Error-level logging (all environments)
     * Use for error conditions
     */
    error: (...args: unknown[]) => {
        console.error('[ERROR]', ...args)
    },
}
